const mongoose = require("mongoose")
const Document = require("./Document")
require('dotenv').config()
const mongourl = process.env.MONGOURI;
// const mongourl = "mongodb://localhost/google-docs-clone";
mongoose.connect(mongourl, () => {
    console.log("connected to database");
})
const port = process.env.PORT || 3001;
const io = require("socket.io")(port, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
})

const defaultValue = ""

io.on("connection", socket => {
    console.log("new connection")
    socket.on("get-document", async documentId => {
        const document = await findOrCreateDocument(documentId)
        socket.join(documentId)
        socket.emit("load-document", document)

        socket.on("send-changes", delta => {
            socket.broadcast.to(documentId).emit("receive-changes", delta)
        })

        socket.on("save-document", async data => {
            await Document.findByIdAndUpdate(documentId, { data })
        })

        socket.on("save-doc-title", async (title) => {
            console.log(title);
            await Document.findByIdAndUpdate(documentId, { title })
        })
    })
})

async function findOrCreateDocument(id) {
    if (id == null) return

    const document = await Document.findById(id)
    if (document) return document
    return await Document.create({ _id: id, data: defaultValue, title: "Untitled Document" })
}

