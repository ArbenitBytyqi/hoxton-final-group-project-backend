import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";


const app = express()
app.use(express.json())
app.use(cors())
const port = 5000

const prisma = new PrismaClient({ log: ['warn', 'error', 'info', 'query'] })



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


app.listen(port, () => {
    console.log(`App is running in http://localhost:${port}`)
})