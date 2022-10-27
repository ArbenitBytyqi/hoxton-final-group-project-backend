import { Author, PrismaClient } from "@prisma/client";
import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateToken, SECRET, hash, getToken } from "./auth";

const prisma = new PrismaClient({
    log: ["error", "info", "query", "warn"]
});

const app = express();
const port = 6677;

app.use(cors());
app.use(express.json());

dotenv.config();

async function getCurrentUser(token: string) {
    const decodedData = jwt.verify(token, SECRET);
    const user = await prisma.user.findUnique({
        where: {
            // @ts-ignore
            id: decodedData.id
        },
        include: {
            reviews: {
                select: {
                    comment: true,
                    stars: true,
                    book: {
                        select: {
                            title: true,
                            image: true
                        }
                    }
                }
            }
        }

    },)
    if (!user)
        return null;

    return user;
}

// post a new book
app.post("/books", async (req, res) => {
    const newBoook = {
        title: req.body.book.title,
        description: req.body.book.description,
        image: req.body.book.image,
        publishedYear: req.body.book.publishedYear,
        category: req.body.book.category,
        price: req.body.book.price,
        stock: req.body.book.stock,
        discountPrice: req.body.book.discountPrice
    }
    const authors = req.body.authors.map((author: Author) => ({
        image: author.image,
        fullname: author.fullname,
    }))
    const book = await prisma.book.create({
        data: {
            ...newBoook,
            author: {
                connectOrCreate: {
                    where: req.body.authors.map((authorName: string) => ({
                        fullname: authorName,
                    })),
                    create: authors
                },
            }
        },
    })
    res.send(book)
})

// get all books with all reviews and their users
app.get("/books", async (req, res) => {
    try {
        const books = await prisma.book.findMany({
            include: {
                reviews: {
                    include: {
                        user: {
                            select: {
                                fullname: true,
                                image: true
                            }
                        }
                    }
                }
            }
        })
        res.send(books)
    } catch (error) {
        //@ts-ignore
        res.status(400).send({ error: error.message })
    }
})

// updated an existing book
app.patch("/books/:id", async (req, res) => {
    try {
        const id = Number(req.params.id)
        const finBook = await prisma.book.findUnique({
            where: {
                id
            }
        })
        if (finBook) {
            const updatedBook = await prisma.book.update({
                where: {
                    id
                },
                data: req.body
            })
            res.send(updatedBook)
        } else {
            res.status(400).send({ error: `No book found with id ${id} ` })
        }
    } catch (error) {
        //@ts-ignore
        res.status(400).send({ error: error.message })
    }
})

// delete an existing book
app.delete("/books/:id", async (req, res) => {
    try {
        const id = Number(req.params.id)
        const finBook = await prisma.book.findUnique({
            where: {
                id
            }
        })
        if (finBook) {
            const book = await prisma.book.delete({
                where: {
                    id: id
                }
            })
            res.send(book)
        } else {
            res.status(400).send({ error: `No book found with id ${id} ` })
        }
    } catch (error) {
        //@ts-ignore
        res.status(400).send({ error: error.message })
    }


})

//get an author and all his books with all reviews with users
app.get("/author/:fullname", async (req, res) => {
    try {
        const author = await prisma.author.findUnique({
            where: {
                fullname: req.params.fullname
            },
            include: {
                books: {
                    include: {
                        reviews: {
                            include: {
                                user: {
                                    select: {
                                        fullname: true,
                                        image: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })
        if (author) res.send(author)
        else res.status(400).send({ error: `We could not find the author with naame ${req.params.fullname}. Try again` })
    } catch (error) {
        //@ts-ignore
        res.status(400).send({ error: error.message })
    }
})

app.post("/author", async (req, res) => {
    try {
        const authorData = {
            fullname: req.body.fullname,
            description: req.body.description,
            image: req.body.image
        }
        const findAuthor = await prisma.author.findUnique({ where: { fullname: authorData.fullname } })
        if (!findAuthor) {
            const newAuthor = await prisma.author.create({ data: authorData })
            res.send(newAuthor)
        }
        else res.status(400).send({ error: `Author with this${authorData.fullname} already exists.` })
    } catch (error) {
        //@ts-ignore
        res.status(400).send({ error: error.message })
    }
})

app.delete("/author/:id", async (req, res) => {
    try {
        const id = Number(req.params.id)
        const findAuthor = await prisma.author.findUnique({
            where: {
                id
            }
        })
        if (findAuthor) {
            const author = await prisma.author.delete({
                where: {
                    id: id
                }
            })
            res.send(author)
        } else {
            res.status(400).send({ error: `No author found with id ${id} ` })
        }
    } catch (error) {
        //@ts-ignore
        res.status(400).send({ error: error.message })
    }
})

//reviews
app.get('/reviews', async (req, res) => {
    const allReviews = await prisma.review.findMany({
        include: {
            book: true,
            user: true
        }
    })
    res.send(allReviews)
})
app.get('/reviews/:id', async (req, res) => {
    const getReviewById = await prisma.review.findUnique({
        where: { id: Number(req.params.id) },
        include: {
            book: true,
            user: true
        }
    })
    if (getReviewById) {
        res.send(getReviewById)
    } else {
        res.status(400).send({ error: "Review not found" })
    }
})

app.post('/reviews', async (req, res) => {
    await prisma.review.create({
        data: req.body,
        include: {
            book: true,
            user: true
        }
    })
    const allReviews = await prisma.review.findMany({
        include: {
            book: true,
            user: true
        }
    })
    res.send(allReviews)
})

app.patch('/reviews/:id', async (req, res) => {
    const updatedReview = await prisma.review.update({
        data: req.body,
        where: { id: Number(req.params.id) },
        include: {
            book: true,
            user: true
        }
    })
    res.send(updatedReview)
})

app.delete('/reviews/:id', async (req, res) => {
    await prisma.review.delete({
        where: { id: Number(req.params.id) }
    })
    const allReviews = await prisma.review.findMany({
        include: {
            book: true,
            user: true
        }
    })
    res.send(allReviews)
})



//Categories


app.get('/categories', async (req, res) => {
    try {
        const getCategories = await prisma.category.findMany({
            include: {
                book: true
            }
        })
        res.send(getCategories)
    } catch (error) {
        //@ts-ignore
        res.status(400).send({ error: error.message })
    }
})

app.get('/categories/:id', async (req, res) => {
    try {
        const getCategoriesById = await prisma.category.findUnique({
            where: { id: Number(req.params.id) },
            include: {
                book: true
            }
        })
        if (getCategoriesById) {
            res.send(getCategoriesById)
        } else {
            res.status(400).send({ error: "Category not found" })
        }
    } catch (error) {
        //@ts-ignore
        res.status(400).send({ error: error.message })
    }
})

app.post("/sign-up", async (req, res) => {
    try {
        const userData = {
            fullname: req.body.fullname,
            image: req.body.image,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password),
            role: req.body.role,
        }

        const findUser = await prisma.user.findUnique({
            where: {
                email: userData.email
            }
        });

        const errors: string[] = [];

        if (typeof userData.fullname !== "string") {
            errors.push("Fullname not provided or not a string");
        }

        if (typeof userData.image !== "string") {
            errors.push("Image not provided or not a string");
        }

        if (typeof userData.email !== "string") {
            errors.push("Email not provided or not a string");
        }

        if (typeof userData.role !== "boolean") {
            errors.push("Role not provided or not a boolean");
        }
        if (typeof userData.password !== "string") {
            errors.push("Password not provided or not a string");
        }


        if (errors.length > 0) {
            res.status(400).send({ errors });
            return
        }

        if (findUser)
            res.send({ message: "This account already exists" })
        else {
            const user = await prisma.user.create({
                data: userData
            });
            const token = generateToken(user.id);
            res.send({ user, token });
        }


    } catch (error) { // @ts-ignore
        res.status(400).send({ errors: error.message });
    }
})

app.post("/sign-in", async (req, res) => {
    try {
        const userData = {
            email: req.body.email,
            password: req.body.password
        }

        const errors: string[] = [];

        if (typeof userData.email !== "string") {
            errors.push("Email not provided or not a string");
        }
        if (typeof userData.password !== "string") {
            errors.push("Password not provided or not a string");
        }

        if (errors.length > 0) {
            res.status(400).send({ errors });
            return;
        }

        const user = await prisma.user.findUnique({
            where: {
                email: userData.email
            },
            include: {
                reviews: {
                    select: {
                        comment: true,
                        stars: true,
                        book: {
                            select: {
                                title: true,
                                image: true
                            }
                        }
                    }
                }
            }
        },);
        if (user && bcrypt.compareSync(userData.password, user.password)) {
            const token = generateToken(user.id);
            res.send({ user, token });
        } else {
            res.status(400).send({ errors: ["Wrong email or password. Try again"] });
        }
    } catch (error) {
        // @ts-ignore
        res.status(400).send({ errors: error.message });
    }
})



app.get("/validate", async (req, res) => {
    try {
        if (req.headers.authorization) {
            const user = await getCurrentUser(req.headers.authorization);
            // @ts-ignore
            res.send({
                // @ts-ignore
                user, token: getToken(user.id)
            });
        }
    } catch (error) {
        // @ts-ignore
        res.status(400).send({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Serveri is running on: http://localhost:${port}`);
})


