const express = require('express')
const expressHandlebars = require('express-handlebars')
const expressSession = require("express-session")
const sqlite3 = require('sqlite3')
var bodyParser = require("body-parser")
const path = require('path')

var bcrypt = require('bcrypt')
const saltRounds = 10
var börjanAvPassword = ""

const ADMIN_USERNAME = "abc"
const ADMIN_PASSWORD = "$2b$10$9tl0mRT/XV4oSw63MyGfoeoQltpxP9fdw0hfCLs5RZvVMXlCvrGb6"

var hashed = ""

bcrypt.hash(ADMIN_PASSWORD, saltRounds, function(err, hash) {
    hashedAdminPassword = hash
})

const db = new sqlite3.Database("database.db")
db.run(`
	CREATE TABLE IF NOT EXISTS blogPost (
		ID INTEGER PRIMARY KEY AUTOINCREMENT,
		Title TEXT,
		Body TEXT
	)
`)

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(express.static(path.join(__dirname, 'public')))
app.use(expressSession({
    secret: "what",
    saveUninitialized: false,
    resave: false
}))

app.engine("hbs", expressHandlebars({
    defaultLayout: 'main.hbs'
}))

app.get('/', function(request, response) {

    const query = ` 
    SELECT * FROM
    blogPost 
    ORDER BY ID DESC
`


    db.all(query, function(error, blogPost) {
        if (error) {
            console.log(error)

            const model = {
                dbErrorOccured: true
            }
            response.render('index.hbs', model)

        } else {

            const model = {
                blogPost,
                dbErrorOccured: false
            }

            response.render('index.hbs', model)
        }
    })
})

app.get('/answer-question.hbs', function(request, response) {
    if (request.session.isLoggedIn) {
        const query = ` 
    SELECT * FROM
    questions 
    ORDER BY ID DESC
`
        db.all(query, function(error, questions) {
            if (error) {
                console.log(error)

                const model = {
                    dbErrorOccured: true
                }
                response.render('answer-question.hbs', model)

            } else {

                const model = {
                    questions,
                    dbErrorOccured: false
                }

                response.render('answer-question.hbs', model)
            }
        })
    } else {
        response.render('index.hbs')
    }
})

app.get('/index.hbs', function(request, response) {
    const query = ` 
            SELECT * FROM
            blogPost 
            ORDER BY ID DESC
    `


    db.all(query, function(error, blogPost) {
            if (error) {
                console.log(error)

                const model = {
                    dbErrorOccured: true
                }
                response.render('index.hbs', model)

            } else {

                const model = {
                    blogPost,
                    dbErrorOccured: false
                }

                response.render('index.hbs', model)
            }
        })
        //response.render('index.hbs') 
})



app.get('/question.hbs', function(request, response) {

    const query = ` 
    SELECT * FROM
    questions 
    ORDER BY ID DESC
`
    db.all(query, function(error, questions) {
        if (error) {
            console.log(error)

            const model = {
                dbErrorOccured: true
            }
            response.render('question.hbs', model)

        } else {

            const model = {
                questions,
                dbErrorOccured: false
            }

            response.render('question.hbs', model)
        }
    })

})

app.post('/question.hbs', function(request, response) {

    const newName = request.body.Name
    const newQuestion = request.body.Question

    const query = ` 
        INSERT INTO 
        questions(Name, Question) 
        VALUES (?, ?)
	`
    const values = [newName, newQuestion]

    db.run(query, values, function(error) {
        if (error) {

            console.log(error)

        } else {
            response.redirect("/question.hbs")
        }
    })

})

app.get('/login.hbs', function(request, response) {
    response.render('login.hbs')
})

app.get('/about.hbs', function(request, response) {
    response.render('about.hbs')
})

app.get('/contact.hbs', function(request, response) {
    response.render('contact.hbs')
})
app.post("/contact.hbs", function(request, response) {

    const newName = request.body.Name
    const newEmail = request.body.Email
    const newMessage = request.body.Message
    const query = ` 
    INSERT INTO 
    contactMessages(Name, Email, Message) 
    VALUES (?, ?, ?)
`
    const values = [newName, newEmail, newMessage]

    db.run(query, values, function(error) {
        if (error) {

            console.log(error)

        } else {
            response.redirect("/contact.hbs")
        }
    })


})

app.get('/edit.hbs', function(request, response) {
    if (request.session.isLoggedIn) {

        const query = ` 
            SELECT * FROM
            blogPost 
            ORDER BY ID
    `


        db.all(query, function(error, blogPost) {
            if (error) {
                console.log(error)

                const model = {
                    dbErrorOccured: true
                }
                response.render('edit.hbs', model)

            } else {

                const model = {
                    blogPost,
                    dbErrorOccured: false
                }

                response.render('edit.hbs', model)
            }
        })
    } else {
        response.render('index.hbs')
    }
})

app.get('/contact-see.hbs', function(request, response) {
    if (request.session.isLoggedIn) {
        const query = ` 
            SELECT * FROM
            contactMessages 
            ORDER BY ID DESC
    `


        db.all(query, function(error, contactMessages) {
            if (error) {
                console.log(error)

                const model = {
                    dbErrorOccured: true
                }
                response.render('contact-see.hbs', model)

            } else {

                const model = {
                    contactMessages,
                    dbErrorOccured: false
                }

                response.render('contact-see.hbs', model)
            }
        })
    } else {
        response.render('index.hbs')
    }
})

app.get('/delete.hbs', function(request, response) {
    if (request.session.isLoggedIn) {
        const query = ` 
    SELECT * FROM
    blogPost 
    ORDER BY ID
`


        db.all(query, function(error, blogPost) {
            if (error) {
                console.log(error)

                const model = {
                    dbErrorOccured: true
                }
                response.render('delete.hbs', model)

            } else {

                const model = {
                    blogPost,
                    dbErrorOccured: false
                }

                response.render('delete.hbs', model)
            }
        })
    } else {
        response.render('index.hbs')
    }
})
app.post('/delete/:ID', function(request, response) {
    const ID = request.params.ID
    const query = ` 
    DELETE FROM
    blogPost WHERE ID = ?
`
    const values = [ID]


    db.run(query, values, function(error, blogPost) {
        if (error) {
            console.log(error)

            const model = {
                dbErrorOccured: true
            }
            response.render('delete.hbs', model)

        } else {

            const model = {
                blogPost,
                dbErrorOccured: false
            }

            response.render('delete.hbs', model)
        }
    })
})

app.get('/delete-questions.hbs', function(request, response) {
    if (request.session.isLoggedIn) {
        const query = ` 
    SELECT * FROM
    questions 
    ORDER BY ID DESC
`


        db.all(query, function(error, questions) {
            if (error) {
                console.log(error)

                const model = {
                    dbErrorOccured: true
                }
                response.render('delete-questions.hbs', model)

            } else {

                const model = {
                    questions,
                    dbErrorOccured: false
                }

                response.render('delete-questions.hbs', model)
            }
        })
    } else {
        response.render('index.hbs')
    }
})

app.post('/delete-questions/:ID', function(request, response) {
    const ID = request.params.ID
    const query = ` 
    DELETE FROM
    questions WHERE ID = ?
`
    const values = [ID]


    db.run(query, values, function(error, questions) {
        if (error) {
            console.log(error)

            const model = {
                dbErrorOccured: true
            }
            response.render('delete-questions.hbs', model)

        } else {

            const model = {
                questions,
                dbErrorOccured: false
            }

            response.render('delete-questions.hbs', model)
        }
    })
})


app.get("/contact-delete/:ID", function(request, response) {
    if (request.session.isLoggedIn) {
        const ID = request.params.ID

        const query = ` 
    SELECT * FROM contactMessages
    WHERE ID = ?
`
        const values = [ID]

        db.get(query, values, function(error, contactMessages) {
            if (error) {
                console.log(error)
            } else {
                const model = {
                    contactMessages
                }
                response.render("contact-delete.hbs", model)
            }
        })
    } else {
        response.render('index.hbs')
    }
})

app.post('/contact-delete/:ID', function(request, response) {
    const ID = request.params.ID
    const query = ` 
    DELETE FROM
    contactMessages WHERE ID = ?
`
    const values = [ID]


    db.run(query, values, function(error, contactMessages) {
        if (error) {
            console.log(error)

            const model = {
                dbErrorOccured: true
            }
            response.render('contact-see.hbs', model)

        } else {

            const model = {
                contactMessages,
                dbErrorOccured: false
            }

            response.render('contact-see.hbs', model)
        }
    })
})


app.get("/contact-edit/:ID", function(request, response) {
    if (request.session.isLoggedIn) {
        const ID = request.params.ID

        const query = ` 
    SELECT * FROM contactMessages
    WHERE ID = ?
`
        const values = [ID]

        db.get(query, values, function(error, contactMessages) {
            if (error) {
                console.log(error)
            } else {
                const model = {
                    contactMessages
                }
                response.render("contact-edit.hbs", model)
            }
        })
    } else {
        response.render('index.hbs')
    }
})


app.post("/contact-edit/:ID", function(request, response) {
    const ID = request.params.ID
    const newName = request.body.Name
    const newEmail = request.body.Email
    const newMessage = request.body.Message

    const query = ` 
    UPDATE contactMessages
    SET Name = ?,
    Email = ?, 
    Message = ?
    WHERE ID = ?
`
    const values = [newName, newEmail, newMessage, ID]

    db.run(query, values, function(error) {
        if (error) {
            console.log(error)
        } else {
            response.redirect("/contact-see.hbs")
        }
    })
})

app.get("/enter-answer/:ID", function(request, response) {
    if (request.session.isLoggedIn) {
        const ID = request.params.ID

        const query = ` 
    SELECT * FROM questions
    WHERE ID = ?
`
        const values = [ID]

        db.get(query, values, function(error, questions) {
            if (error) {
                console.log(error)
            } else {
                const model = {
                    questions
                }
                response.render("enter-answer.hbs", model)
            }
        })
    } else {
        response.render('index.hbs')
    }
})

app.post("/enter-answer/:ID", function(request, response) {
    const ID = request.params.ID
    const newAnswer = request.body.Answer

    const query = ` 
    UPDATE questions
    SET Answer = ?
    WHERE ID = ?
`
    const values = [newAnswer, ID]

    db.run(query, values, function(error) {
        if (error) {
            console.log(error)
        } else {
            response.redirect("/question.hbs")
        }
    })
})

app.get("/edit-post/:ID", function(request, response) {
    if (request.session.isLoggedIn) {
        const ID = request.params.ID

        const query = ` 
    SELECT * FROM blogPost
    WHERE ID = ?
`
        const values = [ID]

        db.get(query, values, function(error, blogPost) {
            if (error) {
                console.log(error)
            } else {
                const model = {
                    blogPost
                }
                response.render("edit-post.hbs", model)
            }
        })
    } else {
        response.render('index.hbs')
    }
})

app.post("/edit-post/:ID", function(request, response) {
    const ID = request.params.ID
    const newTitle = request.body.Title
    const newBody = request.body.Body

    const query = ` 
    UPDATE blogPost
    SET Title = ?, Body = ?
    WHERE ID = ?
`
    const values = [newTitle, newBody, ID]

    db.run(query, values, function(error) {
        if (error) {
            console.log(error)
        } else {
            response.redirect("/index.hbs")
        }
    })
})

app.get('/admin.hbs', function(request, response) {
    if (request.session.isLoggedIn) {
        response.render('admin.hbs')
    } else {
        response.render('index.hbs')
    }
})

app.post("/login.hbs", function(request, response) {

    const enteredUsername = request.body.username
    const enteredPassword = request.body.password


    if (enteredUsername == ADMIN_USERNAME && bcrypt.compareSync(enteredPassword, ADMIN_PASSWORD)) {
        request.session.isLoggedIn = true
        response.redirect("/admin.hbs")
    } else {
        console.log(console.error("Wrong password/Username"))
        response.redirect("/login.hbs")
    }
})

app.post("/admin.hbs", function(request, response) {

    const newTitle = request.body.Title
    const newBody = request.body.Body

    const query = ` 
        INSERT INTO 
        blogPost(Title, Body) 
        VALUES (?, ?)
	`
    const values = [newTitle, newBody, ]

    db.run(query, values, function(error) {
        if (error) {

            console.log(error)

        } else {
            response.redirect("/index.hbs")
        }
    })
})
app.get('*', function(req, res) {
    res.render('pageNotExist.hbs');
});
app.listen(3000)