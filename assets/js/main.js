const MY_SERVER = "https://TRlibraryProject.onrender.com/"

// DISPLAYS:
// Display BOOKS
const getAllBooks = async () => {
    let bookType = ""
    // Create table
    let msg = `<table id="bookTable" class="searchTable" style="text-align: center;">
    <tr>
      <th>Actions</th>
      <th>Book's Name</th>
      <th>Book's Author</th>
      <th>Book's Year of publish</th>
      <th>Book's maximum time of loan</th>
    </tr>`
    let res = ""
    let booktypes = [1, 2, 3]
    await fetch(MY_SERVER + "books", { method: "GET" }).then((response) => response.json()).then((data) => res = data); // GET method to read books from DB
    res.map((book) => {
        // user friendly book type
        if (book["loanType"] == 1) bookType = "up to 10 days"
        else if (book["loanType"] == 2) bookType = "up to 5 days"
        else if (book["loanType"] == 3) bookType = "up to 2 days"
        // Fill table with data
        msg += `<tr>
        <td><button class="btn btn-danger" onclick="delBook(${book["id"]})">Delete Book</button></td>
        <td>${book["name"]}</td>
        <td>${book["author"]}</td>
        <td>${book["yearPublished"]}</td>
        <td>${bookType}</td></tr>
        `}).join("")
    document.getElementById("showBooks").innerHTML = msg;
}
getAllBooks()

// Display CUSTOMERS
const getAllCustomers = async () => {
    // Create table
    let msg = `<table id="custTable" class="searchTable" style="text-align: center;">
  <tr>
    <th>Actions</th>
    <th>customer's Name</th>
    <th>customer's city</th>
    <th>customer's age</th>
  </tr>`
    let res = ""
    await fetch(MY_SERVER + "customers", { method: "GET" }).then((response) => response.json()).then((data) => res = data); // GET method to read customers from DB
    res.map((customer) =>{
    msg += `<tr>
    <td><button class="btn btn-danger" onclick="removeCust(${customer["id"]})">Delete Customer</button></td>
    <td>${customer["name"]}</td>
    <td>${customer["city"]}</td>
    <td>${customer["age"]}</td></tr>`}).join("")
    document.getElementById("showCustomers").innerHTML = msg
}
getAllCustomers()

// Display LOANS
const getAllLoans = async () => {
    // Create table
    let msg = `<table id="loansTable" class="searchTable" style="text-align: center;">
      <tr>
        <th>Actions</th>
        <th>Cusomer's Name</th>
        <th>Loaned Book Name</th>
        <th>Loan's Date</th>
        <th>Loan's Return Date</th>
        <th>Status</th>
      </tr>`
    let loans1 = []; // Create array contains 3 arrays with data from 3 tables
    let bookName, CustName = "";
    let active = true;
    await fetch(MY_SERVER + "loans", { method: "GET" }).then((response) => response.json()).then((data) => loans1.push(data)); // GET method to read loans from DB and push to array
    await fetch(MY_SERVER + "books", { method: "GET" }).then((response) => response.json()).then((data) => loans1.push(data)); // GET method to read books from DB and push to array
    await fetch(MY_SERVER + "customers", { method: "GET" }).then((response) => response.json()).then((data) => loans1.push(data)); // GET method to read customers from DB and push to array
    console.log(loans1) // prints array to console
    loans1[0].map((loan, i) => {
        // calculate today's date and loan date to check loan status
        let d1 = new Date();
        let d2 = new Date(loan["loanDate"])
        let status = "ON TIME"
        if (loan["returnDate"] != "null") {
            d1 = new Date(loan["returnDate"])
            active == false
        }
        var dif = Math.abs(d1 - d2);
        d = Math.round(dif / (1000 * 3600 * 24)) - 1
        console.log(d + " Days");

        // Set status using above calculation
        if (loan["bookType"] == 1 && d > 10) status = "LATE"
        else if (loan["bookType"] == 1 && d == 10) status = "DUE TODAY"
        else if (loan["bookType"] == 2 && d > 5) status = "LATE"
        else if (loan["bookType"] == 2 && d == 5) status = "DUE TODAY"
        else if (loan["bookType"] == 3 && d > 2) status = "LATE"
        else if (loan["bookType"] == 3 && d == 2) status = "DUE TODAY"

        loans1[1].map(book => {
            if (loan["bookId"] == book["id"]) {
                bookName = book["name"]
            }
        })
        loans1[2].map(cust => {
            if (loan["custId"] == cust["id"]) {
                CustName = cust["name"]
            }
        })
        // fills table with late loans data
        if (status == "LATE") {
            if (loan["returnDate"] == "null") {
                msg += `<tr>
                <td><button class="btn btn-warning" onclick="returnBook(${loan["id"]})">Return Book</button></td>
                <td>${CustName}</td>
                <td>${bookName}</td>
                <td>${loan["loanDate"]}</td>
                <td><form class="formContainer"><input type="date" max="${d1.getFullYear()}-${d1.getMonth() + 1}-${d1.getDate()}" id="rDate${loan["id"]}" placeholder="Return Date" name="rDate" required ></form></td>
                <td style="color:red;font-weight: bold">${status}</td></tr>`
            }
            else {
                msg += `<tr>
                <td><button class="btn btn-info">No Action Required</button></td>
                <td>${CustName}</td>
                <td>${bookName}</td>
                <td>${loan["loanDate"]}</td>
                <td>${loan["returnDate"]}</td>
                <td style="color:red;font-weight: bold">RETURNED <br/> ${status}</td></tr>`
            }
        }
        // fills table with DUE TODAY loans data        
        else if (status == "DUE TODAY") {
            if (loan["returnDate"] == "null") {
                msg += `<tr>
                <td><button class="btn btn-warning" onclick="returnBook(${loan["id"]})">Return Book</button></td>
                <td>${CustName}</td>
                <td>${bookName}</td>
                <td>${loan["loanDate"]}</td>
                <td><form class="formContainer"><input type="date" max="${d1.getFullYear()}-${d1.getMonth() + 1}-${d1.getDate()}" id="rDate${loan["id"]}" placeholder="Return Date" name="rDate" max="${d1}" required ></form></td>
                <td style="color:#DBA800;font-weight: bold">${status}</td></tr>`
            }
            else {
                msg += `<tr>
                <td><button class="btn btn-info">No Action Required</button></td>
                <td>${CustName}</td>
                <td>${bookName}</td>
                <td>${loan["loanDate"]}</td>
                <td>${loan["returnDate"]}</td>
                <td style="color:green;font-weight: bold">RETURNED <br/> ON TIME</td></tr>`
            }
        }
        // fills table with on time loans data
        else if (status == "ON TIME") {
            if (loan["returnDate"] == "null") {
                msg += `<tr>
                <td><button class="btn btn-warning" onclick="returnBook(${loan["id"]})">Return Book</button></td>
                <td>${CustName}</td>
                <td>${bookName}</td>
                <td>${loan["loanDate"]}</td>
                <td><form class="formContainer"><input type="date" max="${d1.getFullYear()}-${d1.getMonth() + 1}-${d1.getDate()}" id="rDate${loan["id"]}" required ></form></td>
                <td style="color:green;font-weight: bold">${status}</td></tr>`
            }
            else {
                msg += `<tr>
                <td><button class="btn btn-info">No Action Required</button></td>
                <td>${CustName}</td>
                <td>${bookName}</td>
                <td>${loan["loanDate"]}</td>
                <td>${loan["returnDate"]}</td>
                <td style="color:green;font-weight: bold">RETURNED <br/> ${status}</td></tr>`
            }
        }
    }).join("")
    document.getElementById("showLoans").innerHTML = msg
}
getAllLoans();

// ADD ITEMS
// ADD BOOK
const addBook = async () => {
    // checks if input is not empty and if book type is 1/2/3 and opens toastify notification
    if (document.getElementById("bName").value == "" || document.getElementById("author").value == "" || document.getElementById("yearPublished").value == "" || document.getElementById("bType").value == "") { invalidInput() }
    else if (document.getElementById("bType").value > 3 || document.getElementById("bType").value < 1) { invalidTypeInput() }
    else {
        // Create book in DB using POST method and JSON format
        const res = JSON.parse(`{
        "name":"${document.getElementById("bName").value}",
        "author":"${document.getElementById("author").value}",
        "yearPublished":"${document.getElementById("yearPublished").value}",
        "loanType":${document.getElementById("bType").value}
        }`);
        console.log(res)
        await fetch(MY_SERVER + "books", {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(res)
        })
        location.reload()
    }
}

// ADD CUSTOMER
const addCust = async () => {
    // checks if input is not empty and opens toastify notification
    if (document.getElementById("cName").value == "" || document.getElementById("cCity").value == "" || document.getElementById("cAge").value == "") { invalidInput() }
    else {
        // Create customer in DB using POST method and JSON format
        const res = JSON.parse(`{
        "name":"${document.getElementById("cName").value}",
        "city":"${document.getElementById("cCity").value}",
        "age":${document.getElementById("cAge").value}
        }`);
        console.log(res)
        await fetch(MY_SERVER + "customers", {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(res)
        })
        location.reload()
    }
}

// ADD LOAN
const addLoan = async () => {
    let books = [];
    let customers = [];
    let bks = document.getElementById("booksList")
    for (let i = 0; i < bks.options.length; i++) {
        await books.push(bks.options[i].value)
    }
    let cust = document.getElementById("customersList")
    for (let i = 0; i < cust.options.length; i++) {
        await customers.push(cust.options[i].value)
    }
    // checks if input is not empty and if book id or customer id is not exist and opens toastify notification
    if (document.getElementById("cId").value == "" || document.getElementById("bId").value == "" || document.getElementById("lDate").value == "") { invalidInput() }
    else if (!customers.includes(document.getElementById("cId").value)) { invalidFkInput() }
    else if (!books.includes(document.getElementById("bId").value)) { invalidFkInput() }
    else {
        // Create loan in DB using POST method and JSON format
        const res = JSON.parse(`{
            "custId":${document.getElementById("cId").value},
            "bookId":${document.getElementById("bId").value},
            "loanDate":"${document.getElementById("lDate").value}"
            }`);
        console.log(res)
        await fetch(MY_SERVER + "loans", {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(res)
        })
        location.reload()
    }
}

// CLOSE LOAN
const returnBook = async (id) => {
    // update loan using PATCH method in order to return a book
    const res = JSON.parse(`{"returnDate":"${document.getElementById(`rDate${id}`).value}"}`);
    if (document.getElementById(`rDate${id}`).value == "") { invalidInput() }
    else {
        console.log(res)
        await fetch(MY_SERVER + `loans/${id}`, {
            method: "PATCH",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(res)
        })
        location.reload()
    }
}

// DELETE CUSTOMER
const removeCust = async (id) => {
    // REMOVE a customer using DELETE method
    await fetch(MY_SERVER + `customers/${id}`, { method: "DELETE" })
    location.reload()
}

// DELETE BOOK
const delBook = async (id) => {
    // REMOVE a book using DELETE method
    await fetch(MY_SERVER + `books/${id}`, { method: "DELETE" })
    location.reload()
}

// search for book by name
const searchBook = () => {
    var input, filter, table, tr, td, i, txtValue;
    input = document.getElementById("searchForBook");
    filter = input.value.toUpperCase();
    table = document.getElementById("bookTable");
    tr = table.getElementsByTagName("tr");
    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[1];
        if (td) {
            txtValue = td.textContent || td.innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}

// search for customer by name
const searchCust = () => {
    var input, filter, table, tr, td, i, txtValue;
    input = document.getElementById("searchForCust");
    filter = input.value.toUpperCase();
    table = document.getElementById("custTable");
    tr = table.getElementsByTagName("tr");
    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[1];
        if (td) {
            txtValue = td.textContent || td.innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}

// show ONLY LATE loans
const showLate = async () => {
    var filter, table, tr, td, i, txtValue;
    filter = "LATE"
    table = document.getElementById("loansTable");
    tr = await table.getElementsByTagName("tr");
    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[5];
        if (td) {
            txtValue = td.textContent || td.innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}

// show ONLY ON TIME loans
const showOnTime = async () => {
    var filter, table, tr, td, i, txtValue;
    filter = "ON TIME"
    table = document.getElementById("loansTable");
    tr = await table.getElementsByTagName("tr");
    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[5];
        if (td) {
            txtValue = td.textContent || td.innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}

// show ALL loans
const showAll = async () => {
    var filter, table, tr, td, i, txtValue;
    filter = ""
    table = document.getElementById("loansTable");
    tr = await table.getElementsByTagName("tr");
    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[5];
        if (td) {
            txtValue = td.textContent || td.innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}

// show DUE TODAY loans
const showToday = async () => {
    var filter, table, tr, td, i, txtValue;
    filter = "DUE TODAY"
    table = document.getElementById("loansTable");
    tr = await table.getElementsByTagName("tr");
    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[5];
        if (td) {
            txtValue = td.textContent || td.innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}

// show RETURNED loans
const showReturned = async () => {
    var filter, table, tr, td, i, txtValue;
    filter = "RETURNED"
    table = document.getElementById("loansTable");
    tr = await table.getElementsByTagName("tr");
    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[5];
        if (td) {
            txtValue = td.textContent || td.innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}

// insert customers names to new loan screen
const listCust = async () => {
    let res = []
    let lst = ""
    await fetch(MY_SERVER + "customers", { method: "GET" }).then((response) => response.json()).then((data) => res = data);
    console.log(res)
    res.map(cst => {
        lst += `<option value="${cst['id']}"> ${cst['name']} </option>`
    })
    document.getElementById('customersList').innerHTML = lst
}

// insert books names to new loan screen
const listBooks = async () => {
    let res = []
    let lst = ""
    await fetch(MY_SERVER + "books", { method: "GET" }).then((response) => response.json()).then((data) => res = data);
    console.log(res)
    res.map(book => {
        lst += `<option value="${book['id']}"> ${book['name']} </option>`
    })
    document.getElementById('booksList').innerHTML = lst
}


(function () {
    "use strict";

    /**
     * Easy selector helper function
     */
    const select = (el, all = false) => {
        el = el.trim()
        if (all) {
            return [...document.querySelectorAll(el)]
        } else {
            return document.querySelector(el)
        }
    }

    /**
     * Easy event listener function
     */
    const on = (type, el, listener, all = false) => {
        let selectEl = select(el, all)
        if (selectEl) {
            if (all) {
                selectEl.forEach(e => e.addEventListener(type, listener))
            } else {
                selectEl.addEventListener(type, listener)
            }
        }
    }

    /**
     * Easy on scroll event listener 
     */
    const onscroll = (el, listener) => {
        el.addEventListener('scroll', listener)
    }

    /**
     * Navbar links active state on scroll
     */
    let navbarlinks = select('#navbar .scrollto', true)
    const navbarlinksActive = () => {
        let position = window.scrollY + 200
        navbarlinks.forEach(navbarlink => {
            if (!navbarlink.hash) return
            let section = select(navbarlink.hash)
            if (!section) return
            if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
                navbarlink.classList.add('active')
            } else {
                navbarlink.classList.remove('active')
            }
        })
    }
    window.addEventListener('load', navbarlinksActive)
    onscroll(document, navbarlinksActive)

    /**
     * Scrolls to an element with header offset
     */
    const scrollto = (el) => {
        let header = select('#header')
        let offset = header.offsetHeight

        if (!header.classList.contains('header-scrolled')) {
            offset -= 16
        }

        let elementPos = select(el).offsetTop
        window.scrollTo({
            top: elementPos - offset,
            behavior: 'smooth'
        })
    }

    /**
     * Header fixed top on scroll
     */
    let selectHeader = select('#header')
    if (selectHeader) {
        let headerOffset = selectHeader.offsetTop
        let nextElement = selectHeader.nextElementSibling
        const headerFixed = () => {
            if ((headerOffset - window.scrollY) <= 0) {
                selectHeader.classList.add('fixed-top')
                nextElement.classList.add('scrolled-offset')
            } else {
                selectHeader.classList.remove('fixed-top')
                nextElement.classList.remove('scrolled-offset')
            }
        }
        window.addEventListener('load', headerFixed)
        onscroll(document, headerFixed)
    }

    /**
     * Back to top button
     */
    let backtotop = select('.back-to-top')
    if (backtotop) {
        const toggleBacktotop = () => {
            if (window.scrollY > 100) {
                backtotop.classList.add('active')
            } else {
                backtotop.classList.remove('active')
            }
        }
        window.addEventListener('load', toggleBacktotop)
        onscroll(document, toggleBacktotop)
    }

    /**
     * Mobile nav toggle
     */
    on('click', '.mobile-nav-toggle', function (e) {
        select('#navbar').classList.toggle('navbar-mobile')
        this.classList.toggle('bi-list')
        this.classList.toggle('bi-x')
    })

    /**
     * Mobile nav dropdowns activate
     */
    on('click', '.navbar .dropdown > a', function (e) {
        if (select('#navbar').classList.contains('navbar-mobile')) {
            e.preventDefault()
            this.nextElementSibling.classList.toggle('dropdown-active')
        }
    }, true)

    /**
     * Scrool with ofset on links with a class name .scrollto
     */
    on('click', '.scrollto', function (e) {
        if (select(this.hash)) {
            e.preventDefault()

            let navbar = select('#navbar')
            if (navbar.classList.contains('navbar-mobile')) {
                navbar.classList.remove('navbar-mobile')
                let navbarToggle = select('.mobile-nav-toggle')
                navbarToggle.classList.toggle('bi-list')
                navbarToggle.classList.toggle('bi-x')
            }
            scrollto(this.hash)
        }
    }, true)

    /**
     * Scroll with ofset on page load with hash links in the url
     */
    window.addEventListener('load', () => {
        if (window.location.hash) {
            if (select(window.location.hash)) {
                scrollto(window.location.hash)
            }
        }
    });

    /**
     * Preloader
     */
    let preloader = select('#preloader');
    if (preloader) {
        window.addEventListener('load', () => {
            preloader.remove()
        });
    }

    /**
     * Initiate Pure Counter 
     */
    new PureCounter();

})()

// Shows a toastify notification for missing input data
const invalidInput = () => {
    Toastify({
        text: "Please fill all mandatory fields",
        duration: 3000,
        newWindow: true,
        close: true,
        gravity: "bottom", // `top` or `bottom`
        position: "right", // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: {
            background: "linear-gradient(to right, #00b09b, #96c93d)",
        },
        onClick: function () { } // Callback after click
    }).showToast();
}

// Shows a toastify notification for incorrect book type
const invalidTypeInput = () => {
    Toastify({
        text: "Book type must be between 1 to 3",
        duration: 3000,
        newWindow: true,
        close: true,
        gravity: "bottom", // `top` or `bottom`
        position: "right", // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: {
            background: "linear-gradient(to right, #00b09b, #96c93d)",
        },
        onClick: function () { } // Callback after click
    }).showToast();
}

// Shows a toastify notification for adding a non existing book id or customer id to a loan
const invalidFkInput = () => {
    Toastify({
        text: "Book's ID and Customer's ID must exist",
        duration: 3000,
        newWindow: true,
        close: true,
        gravity: "bottom", // `top` or `bottom`
        position: "right", // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: {
            background: "linear-gradient(to right, #00b09b, #96c93d)",
        },
        onClick: function () { } // Callback after click
    }).showToast();
}
