from flask import Flask,request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import json

app = Flask(__name__)
CORS(app)
app.debug = True
app.config['CORS_HEADERS'] = 'Content-Type'
# Create SQLITE Database - myDb
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///myDb.sqlite3'
app.config['SECRET_KEY'] = "random string"
db = SQLAlchemy(app)

#Models
class Books(db.Model):
    id = db.Column(db.Integer,primary_key=True)
    name = db.Column(db.String)
    author = db.Column(db.String)
    yearPublished = db.Column(db.Integer)
    loanType = db.Column(db.Integer)
    loans = db.relationship('Loans',backref='books')

    def __init__(self,name,author,yearPublished,loanType):
        self.name = name
        self.author = author
        self.yearPublished = yearPublished
        self.loanType = loanType

class Customers(db.Model):
    id = db.Column(db.Integer,primary_key=True)
    name = db.Column(db.String)
    city = db.Column(db.String)
    age = db.Column(db.Integer)
    loans = db.relationship('Loans',backref='customers')

    def __init__(self,name,city,age):
        self.name = name
        self.city = city
        self.age = age

class Loans(db.Model):
    id = db.Column(db.Integer,primary_key=True)
    custId = db.Column(db.Integer, db.ForeignKey('customers.id'))
    bookId = db.Column(db.Integer, db.ForeignKey('books.id'))
    loanDate = db.Column(db.String)
    returnDate = db.Column(db.String)

    def __init__(self,custId,bookId,loanDate,returnDate = "null"):
        self.custId = custId
        self.bookId = bookId
        self.loanDate = loanDate
        self.returnDate = returnDate

#Book Views
@app.route('/books',methods=['GET','POST'])
@app.route('/books/<id>',methods=['PUT','DELETE','PATCH'])
def Book(id = 0):
    if request.method == 'GET':
        res = []
        for book in Books.query.all():
            res.append({"id":book.id,"name":book.name,"author":book.author,"yearPublished":book.yearPublished,"loanType":book.loanType})
        return  (json.dumps(res))

    elif request.method == 'POST':
        tmpBook = request.get_json()
        name = tmpBook["name"]
        author = tmpBook["author"]
        yearPublished = tmpBook["yearPublished"]
        loanType = tmpBook["loanType"]
        newBook = Books(name,author,yearPublished,loanType)
        db.session.add(newBook)
        db.session.commit()
        return "New Book Added"

    elif request.method == 'PUT':
        tmpBook = request.get_json()
        updBook = Books.query.filter_by(id = id).first()
        updBook.name = tmpBook["name"]
        updBook.author = tmpBook["author"]
        updBook.yearPublished = tmpBook["yearPublished"]
        updBook.loanType = tmpBook["loanType"]
        db.session.commit()
        return "Book updated"

    elif request.method == 'DELETE':
        delBook = Books.query.filter_by(id = id).first()
        db.session.delete(delBook)
        db.session.commit()
        return "Book deleted"

#customers Views
@app.route('/customers',methods=['GET','POST'])
@app.route('/customers/<id>',methods=['PUT','DELETE','PATCH'])
def customer(id = 0):
    if request.method == 'GET':
        res = []
        for customer in Customers.query.all():
            res.append({"id":customer.id,"name":customer.name,"city":customer.city,"age":customer.age})
        return (json.dumps(res))

    elif request.method == 'POST':
        tmpCst = request.get_json()
        name = tmpCst["name"]
        city = tmpCst["city"]
        age = tmpCst["age"]
        newCst = Customers(name,city,age)
        db.session.add(newCst)
        db.session.commit()
        return "New Customer Added"

    elif request.method == 'PUT':
        tmpCst = request.get_json()
        updCst = Customers.query.filter_by(id = id).first()
        updCst.name = tmpCst["name"]
        updCst.city = tmpCst["city"]
        updCst.age = tmpCst["age"]
        db.session.commit()
        return "Customer updated"

    elif request.method == 'DELETE':
        delCust = Customers.query.filter_by(id = id).first()
        db.session.delete(delCust)
        db.session.commit()
        return "Customer deleted"

#Loans Views
@app.route('/loans',methods=['GET','POST'])
@app.route('/loans/<id>',methods=['PATCH'])
def loan(id = 0):
    if request.method == 'GET':
        res = []
        for loan,book in db.session.query(Loans,Books).join(Books).all():
            res.append({"id":loan.id,"custId":loan.custId,"bookId":loan.bookId,"loanDate":loan.loanDate,"returnDate":loan.returnDate,"bookType":book.loanType})
        return (json.dumps(res))

    elif request.method == 'POST':
        tmpLoan = request.get_json()
        custId = tmpLoan["custId"]
        bookId = tmpLoan["bookId"]
        loanDate = tmpLoan["loanDate"]
        newLoan = Loans(custId,bookId,loanDate)
        db.session.add(newLoan)
        db.session.commit()
        return "Book Loaned Successfully"
    
    elif request.method == "PATCH":
        updLoan = Loans.query.filter_by(id = id).first()
        tmpLoan = request.get_json()
        updLoan.returnDate = tmpLoan["returnDate"]
        db.session.commit()
        return "Book successfully returned"

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)