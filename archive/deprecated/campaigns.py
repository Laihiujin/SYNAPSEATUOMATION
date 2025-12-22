from flask import Blueprint, jsonify

campaigns_bp = Blueprint('campaigns_bp', __name__)

@campaigns_bp.route('/api/campaigns/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok", "module": "campaigns"})
