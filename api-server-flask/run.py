# -*- encoding: utf-8 -*-
from api import app, db

@app.shell_context_processor
def make_shell_context():
    return {"app": app,
            "db": db
            }

@app.route('/test-db')
def test_db():
    try:
        db.session.execute('SELECT 1')
        return 'Connected to Database: {}'.format(app.config['SQLALCHEMY_DATABASE_URI'])
    except Exception as e:
        return 'Database connection failed: {}'.format(str(e))
    
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True, threaded=True)
