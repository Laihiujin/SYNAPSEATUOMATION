from flask import Blueprint, jsonify

accounts_bp = Blueprint('accounts_bp', __name__)

@accounts_bp.route('/api/accounts/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok", "module": "accounts"})
