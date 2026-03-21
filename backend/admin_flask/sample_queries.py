"""Sample MongoDB and SQL queries for the admin dashboard pages."""

# MongoDB examples
mongo_queries = {
    "dashboard": {
        "total_users": "db.users.countDocuments({})",
        "total_courses": "db.courses.countDocuments({})",
        "total_roadmaps": "db.roadmaps.countDocuments({})",
        "total_evaluations": "db.evaluations.countDocuments({})",
    },
    "users": "db.users.find({}, {name: 1, email: 1, role: 1})",
    "courses": "db.courses.find({}).sort({created_at: -1})",
    "roadmaps": "db.roadmaps.find({}).sort({created_at: -1})",
    "evaluations": "db.evaluations.find({}).sort({created_at: -1})",
}

# SQL examples
sql_queries = {
    "dashboard": {
        "total_users": "SELECT COUNT(*) AS total_users FROM users;",
        "total_courses": "SELECT COUNT(*) AS total_courses FROM courses;",
        "total_roadmaps": "SELECT COUNT(*) AS total_roadmaps FROM roadmaps;",
        "total_evaluations": "SELECT COUNT(*) AS total_evaluations FROM evaluations;",
    },
    "users": "SELECT name, email, role FROM users ORDER BY email ASC;",
    "courses": "SELECT user_email, title, details FROM courses ORDER BY created_at DESC;",
    "roadmaps": "SELECT user_email, title, details FROM roadmaps ORDER BY created_at DESC;",
    "evaluations": "SELECT user_email, score, details FROM evaluations ORDER BY created_at DESC;",
}
