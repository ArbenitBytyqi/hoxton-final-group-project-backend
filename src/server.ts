import { PrismaClient } from "@prisma/client";
import cors from "cors";
import express from "express";

const prisma = new PrismaClient({
    log: ["error", "info", "query", "warn"]
});

const app = express();
const port = 6677;

app.use(cors());
app.use(express.json());



// post a new book
app.post("/books", async (req, res) => {
    const newBoook = {
        title: req.body.title,
        description: req.body.description,
        image: req.body.image,
        publishedYear: req.body.publishedYear,
        author: req.body.author,
        category: req.body.category,
        price: req.body.price,
        stock: req.body.stock,
        discountPrice: req.body.discountPrice
    }
    const book = await prisma.book.create({ data: newBoook })
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


app.listen(port, () => {
    console.log(`Serveri is running on: http://localhost:${port}`);
})
