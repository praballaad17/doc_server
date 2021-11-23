const { Schema, model } = require("mongoose")

const Document = new Schema({
    _id: String,
    data: Object,
    title: String
})

module.exports = model("Document", Document)