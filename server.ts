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
    try {
        const allReviews = await prisma.review.findMany({
            include: {
                book: true,
                user: true
            }
        })
        res.send(allReviews)
    } catch (error) {
        // @ts-ignore
        res.status(400).send({ error: error.message })
    }
})

app.get('/reviews/:id', async (req, res) => {
    try {
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
    } catch (error) {
        // @ts-ignore
        res.status(400).send({ error: error.message })
    }
})

app.post('/reviews', async (req, res) => {
    try {
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
    } catch (error) {
        // @ts-ignore
        res.status(400).send({ error: error.message })
    }
})

app.patch('/reviews/:id', async (req, res) => {
    try {
        const updatedReview = await prisma.review.update({
            data: req.body,
            where: { id: Number(req.params.id) },
            include: {
                book: true,
                user: true
            }
        })
        res.send(updatedReview)
    } catch (error) {
        // @ts-ignore
        res.status(400).send({ error: error.message })
    }
})

app.delete('/reviews/:id', async (req, res) => {
    try {
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
    } catch (error) {
        // @ts-ignore
        res.status(400).send({ error: error.message })
    }
})


app.listen(port, () => {
    console.log(`App is running in http://localhost:${port}`)
})