require('dotenv').config({path: "./config.env"})
const express = require('express');
const connectDB = require('./config/db')
const errorHandler = require('./middleware/error')
const cors = require('cors')

connectDB();
const app = express();

app.use(express.json());
app.use(cors());
app.options("*", cors());
app.use('/api/auth', require('./routes/auth'));
app.use('/api/private', require('./routes/private'));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => console.log(`server start on ${PORT}`));

process.on("unhandledRejection", (err, promise) => {
    console.log(`log error : ${err}`);
    server.close(() => process.exit(1));
})