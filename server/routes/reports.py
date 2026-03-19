from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from config import db
from models import Invoice, Tenant, User, Apartment, Property, Payment
from datetime import datetime, date
from dateutil.relativedelta import relativedelta
from sqlalchemy import func

reports_bp = Blueprint('reports', __name__, url_prefix='/api/reports')


def get_landlord_or_403(user_id):
    user = User.query.get(int(user_id))
    if not user or user.role != 'landlord':
        return None, jsonify({'error': 'Unauthorized'}), 403
    return user, None, None


@reports_bp.route('/overview', methods=['GET'])
@jwt_required()
def get_overview():
    try:
        user, err, code = get_landlord_or_403(get_jwt_identity())
        if err:
            return err, code

        property_ids   = [p.id for p in user.properties]
        apartment_ids  = db.session.query(Apartment.id).filter(Apartment.property_id.in_(property_ids)).all()
        apartment_ids  = [a[0] for a in apartment_ids]

        total_units    = len(apartment_ids)
        occupied_units = Apartment.query.filter(
            Apartment.id.in_(apartment_ids), Apartment.status == 'occupied'
        ).count()
        vacant_units   = total_units - occupied_units
        occupancy_rate = round((occupied_units / total_units * 100), 1) if total_units else 0

        # Active tenants
        active_tenants = Tenant.query.join(Apartment).filter(
            Apartment.property_id.in_(property_ids),
            Tenant.status == 'active'
        ).count()

        # Current month revenue
        current_month = date.today().strftime('%Y-%m')
        month_payments = Payment.query.filter(
            Payment.apartment_id.in_(apartment_ids),
            Payment.month_paid_for == current_month,
            Payment.status == 'completed'
        ).all()
        current_month_revenue = sum(float(p.amount) for p in month_payments)

        # All-time revenue
        all_payments = Payment.query.filter(
            Payment.apartment_id.in_(apartment_ids),
            Payment.status == 'completed'
        ).all()
        total_revenue = sum(float(p.amount) for p in all_payments)

        # Outstanding invoices
        outstanding = Invoice.query.filter(
            Invoice.apartment_id.in_(apartment_ids),
            Invoice.status.in_(['pending', 'overdue'])
        ).all()
        outstanding_amount = sum(float(i.total_amount) for i in outstanding)

        # Overdue invoices
        today = date.today()
        overdue = [i for i in outstanding if i.due_date and i.due_date < today]
        overdue_amount = sum(float(i.total_amount) for i in overdue)

        return jsonify({
            'total_properties': len(user.properties),
            'total_units': total_units,
            'occupied_units': occupied_units,
            'vacant_units': vacant_units,
            'occupancy_rate': occupancy_rate,
            'active_tenants': active_tenants,
            'current_month_revenue': f'{current_month_revenue:.2f}',
            'total_revenue': f'{total_revenue:.2f}',
            'outstanding_amount': f'{outstanding_amount:.2f}',
            'overdue_amount': f'{overdue_amount:.2f}',
            'overdue_count': len(overdue),
            'current_month': current_month,
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@reports_bp.route('/revenue-trend', methods=['GET'])
@jwt_required()
def get_revenue_trend():
    try:
        user, err, code = get_landlord_or_403(get_jwt_identity())
        if err:
            return err, code

        property_ids  = [p.id for p in user.properties]
        apartment_ids = [a[0] for a in db.session.query(Apartment.id).filter(
            Apartment.property_id.in_(property_ids)).all()]

        months = []
        today  = date.today()
        for i in range(5, -1, -1):
            d     = today - relativedelta(months=i)
            month = d.strftime('%Y-%m')
            label = d.strftime('%b %Y')

            payments = Payment.query.filter(
                Payment.apartment_id.in_(apartment_ids),
                Payment.month_paid_for == month,
                Payment.status == 'completed'
            ).all()
            revenue = sum(float(p.amount) for p in payments)

            invoices_for_month = Invoice.query.filter(
                Invoice.apartment_id.in_(apartment_ids),
                Invoice.month_year == month
            ).all()
            expected = sum(float(i.total_amount) for i in invoices_for_month)

            months.append({
                'month': month,
                'label': label,
                'revenue': round(revenue, 2),
                'expected': round(expected, 2),
                'payment_count': len(payments),
            })

        return jsonify({'trend': months}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@reports_bp.route('/invoices', methods=['GET'])
@jwt_required()
def get_invoice_report():
    try:
        user, err, code = get_landlord_or_403(get_jwt_identity())
        if err:
            return err, code

        property_ids  = [p.id for p in user.properties]
        apartment_ids = [a[0] for a in db.session.query(Apartment.id).filter(
            Apartment.property_id.in_(property_ids)).all()]

        month_year = request.args.get('month_year')
        status     = request.args.get('status')

        query = Invoice.query.filter(Invoice.apartment_id.in_(apartment_ids))
        if month_year:
            query = query.filter(Invoice.month_year == month_year)
        if status:
            query = query.filter(Invoice.status == status)

        invoices = query.order_by(Invoice.created_at.desc()).all()
        today    = date.today()

        rows = []
        for inv in invoices:
            tenant     = Tenant.query.get(inv.tenant_id)
            apartment  = Apartment.query.get(inv.apartment_id)
            prop       = Property.query.get(apartment.property_id) if apartment else None

            is_overdue = inv.status != 'paid' and inv.due_date and inv.due_date < today

            rows.append({
                'id': inv.id,
                'invoice_number': inv.invoice_number,
                'tenant_name': tenant.name if tenant else 'Unknown',
                'apartment_number': apartment.apartment_number if apartment else '—',
                'property_name': prop.name if prop else '—',
                'month_year': inv.month_year,
                'rent_amount': float(inv.rent_amount),
                'late_fee': float(inv.late_fee),
                'other_charges': float(inv.other_charges),
                'total_amount': float(inv.total_amount),
                'due_date': inv.due_date.strftime('%Y-%m-%d') if inv.due_date else None,
                'status': 'overdue' if is_overdue else inv.status,
                'payment_id': inv.payment_id,
                'created_at': inv.created_at.isoformat(),
            })

        paid    = [r for r in rows if r['status'] == 'paid']
        pending = [r for r in rows if r['status'] == 'pending']
        overdue = [r for r in rows if r['status'] == 'overdue']

        return jsonify({
            'invoices': rows,
            'total_count': len(rows),
            'paid_count': len(paid),
            'pending_count': len(pending),
            'overdue_count': len(overdue),
            'total_billed': round(sum(r['total_amount'] for r in rows), 2),
            'total_collected': round(sum(r['total_amount'] for r in paid), 2),
            'total_outstanding': round(sum(r['total_amount'] for r in pending) + sum(r['total_amount'] for r in overdue), 2),
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@reports_bp.route('/by-property', methods=['GET'])
@jwt_required()
def get_property_report():
    try:
        user, err, code = get_landlord_or_403(get_jwt_identity())
        if err:
            return err, code

        month_year = request.args.get('month_year', date.today().strftime('%Y-%m'))
        result = []

        for prop in user.properties:
            apt_ids = [a.id for a in prop.apartments]
            if not apt_ids:
                continue

            occupied = sum(1 for a in prop.apartments if a.status == 'occupied')
            payments = Payment.query.filter(
                Payment.apartment_id.in_(apt_ids),
                Payment.month_paid_for == month_year,
                Payment.status == 'completed'
            ).all()
            invoices = Invoice.query.filter(
                Invoice.apartment_id.in_(apt_ids),
                Invoice.month_year == month_year
            ).all()

            revenue  = sum(float(p.amount) for p in payments)
            expected = sum(float(i.total_amount) for i in invoices)

            result.append({
                'property_id': prop.id,
                'property_name': prop.name,
                'city': prop.city,
                'total_units': prop.total_units,
                'occupied_units': occupied,
                'vacant_units': prop.total_units - occupied,
                'occupancy_rate': round(occupied / prop.total_units * 100, 1) if prop.total_units else 0,
                'revenue': round(revenue, 2),
                'expected': round(expected, 2),
                'collection_rate': round(revenue / expected * 100, 1) if expected else 0,
                'payment_count': len(payments),
            })

        return jsonify({'properties': result, 'month_year': month_year}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500