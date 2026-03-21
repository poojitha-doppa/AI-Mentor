import json
import os
from functools import wraps
from typing import Any

from flask import Flask, abort, flash, redirect, render_template, request, session, url_for
from pymongo import MongoClient
from werkzeug.security import check_password_hash

ADMIN_EMAILS = {
    "harishbonu3@gmail.com",
    "poojithadoppa8@gmail.com",
}


def create_app() -> Flask:
    app = Flask(__name__)
    app.secret_key = os.getenv("FLASK_SECRET_KEY", "replace-this-in-production")

    mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
    mongo_db_name = os.getenv("MONGO_DB_NAME", "careersync")

    mongo_client = MongoClient(mongo_uri)
    db = mongo_client[mongo_db_name]

    def verify_password(user: dict[str, Any], provided_password: str) -> bool:
        """Verify plain or hashed password from DB user record."""
        password_hash = user.get("password_hash")
        if password_hash:
            return check_password_hash(password_hash, provided_password)

        # Optional fallback if legacy data stores plain text password.
        plain_password = user.get("password")
        return bool(plain_password) and plain_password == provided_password

    def extract_user_email(doc: dict[str, Any]) -> str:
        if "user_email" in doc:
            return str(doc.get("user_email") or "")
        if "email" in doc:
            return str(doc.get("email") or "")
        user_data = doc.get("user")
        if isinstance(user_data, dict):
            return str(user_data.get("email") or "")
        return ""

    def compact_document_details(doc: dict[str, Any], skip_keys: set[str] | None = None) -> str:
        skip = skip_keys or set()
        filtered = {}
        for key, value in doc.items():
            if key in skip:
                continue
            filtered[key] = value
        return json.dumps(filtered, default=str)

    def admin_required(view_func):
        @wraps(view_func)
        def wrapped(*args, **kwargs):
            if not session.get("user_email"):
                return redirect(url_for("login"))
            if session.get("role") != "admin":
                return abort(403)
            return view_func(*args, **kwargs)

        return wrapped

    @app.route("/")
    def home():
        if session.get("role") == "admin":
            return redirect(url_for("admin_dashboard"))
        return redirect(url_for("login"))

    @app.route("/login", methods=["GET", "POST"])
    def login():
        if request.method == "POST":
            email = request.form.get("email", "").strip().lower()
            password = request.form.get("password", "")

            user = db.users.find_one({"email": email})
            if not user or not verify_password(user, password):
                flash("Invalid email or password", "error")
                return render_template("login.html"), 401

            assigned_role = "admin" if email in ADMIN_EMAILS else "user"

            session.clear()
            session["user_id"] = str(user.get("_id", ""))
            session["user_email"] = email
            session["role"] = assigned_role

            if assigned_role == "admin":
                return redirect(url_for("admin_dashboard"))

            flash("Login successful, but this account does not have admin access.", "info")
            return redirect(url_for("login"))

        return render_template("login.html")

    @app.route("/logout")
    def logout():
        session.clear()
        return redirect(url_for("login"))

    @app.route("/admin/dashboard")
    @admin_required
    def admin_dashboard():
        stats = {
            "total_users": db.users.count_documents({}),
            "total_courses": db.courses.count_documents({}),
            "total_roadmaps": db.roadmaps.count_documents({}),
            "total_evaluations": db.evaluations.count_documents({}),
        }
        return render_template("dashboard.html", stats=stats)

    @app.route("/admin/users")
    @admin_required
    def admin_users():
        users = list(db.users.find({}, {"name": 1, "email": 1, "role": 1}).sort("email", 1))
        for user in users:
            email = str(user.get("email", "")).lower()
            if not user.get("role"):
                user["role"] = "admin" if email in ADMIN_EMAILS else "user"
        return render_template("users.html", users=users)

    @app.route("/admin/courses")
    @admin_required
    def admin_courses():
        courses = list(db.courses.find({}).sort("created_at", -1))
        rows = []
        for course in courses:
            rows.append(
                {
                    "user_email": extract_user_email(course),
                    "title": course.get("title") or course.get("course_title") or "Untitled course",
                    "details": compact_document_details(
                        course,
                        skip_keys={"_id", "user_email", "email", "user", "title", "course_title"},
                    ),
                }
            )
        return render_template("courses.html", courses=rows)

    @app.route("/admin/roadmaps")
    @admin_required
    def admin_roadmaps():
        roadmaps = list(db.roadmaps.find({}).sort("created_at", -1))
        rows = []
        for roadmap in roadmaps:
            rows.append(
                {
                    "user_email": extract_user_email(roadmap),
                    "title": roadmap.get("title") or roadmap.get("goal") or "Untitled roadmap",
                    "details": compact_document_details(
                        roadmap,
                        skip_keys={"_id", "user_email", "email", "user", "title", "goal"},
                    ),
                }
            )
        return render_template("roadmaps.html", roadmaps=rows)

    @app.route("/admin/evaluations")
    @admin_required
    def admin_evaluations():
        evaluations = list(db.evaluations.find({}).sort("created_at", -1))
        rows = []
        for evaluation in evaluations:
            rows.append(
                {
                    "user_email": extract_user_email(evaluation),
                    "score": evaluation.get("score") or evaluation.get("overall_score") or "N/A",
                    "details": compact_document_details(
                        evaluation,
                        skip_keys={"_id", "user_email", "email", "user", "score", "overall_score"},
                    ),
                }
            )
        return render_template("evaluations.html", evaluations=rows)

    @app.errorhandler(403)
    def forbidden(_error):
        return "403 Forbidden: Admin access required.", 403

    return app


if __name__ == "__main__":
    flask_app = create_app()
    flask_app.run(host="0.0.0.0", port=int(os.getenv("PORT", "8000")), debug=True)
