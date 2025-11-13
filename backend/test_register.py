from main import UserCreate, register
from db import SessionLocal

u = UserCreate(username='testdirect', email='direct@example.com', password='pass1234', role='user')
db = SessionLocal()
try:
    res = register(u, db)
    print('REGISTERED:', res)
except Exception as e:
    import traceback
    traceback.print_exc()
finally:
    db.close()
