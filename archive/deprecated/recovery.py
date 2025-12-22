from flask import Blueprint, jsonify

recovery_bp = Blueprint('recovery_bp', __name__)

@recovery_bp.route('/api/recovery/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok", "module": "recovery"})
