const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require('dotenv').config()
const app = express();

/* Cargar rutas */
const authRoutes = require("./src/routes/auth");
const userRoutes = require("./src/routes/user");
const eventRoutes = require("./src/routes/event");
// const departamentoMunicipioRoutes = require('./src/routes/departamentoMunicipio');

/* Trabajar con la extensión client-rest */
app.use(bodyParser.json());
/* Pruebas de request utilizando postman */
app.use(bodyParser.urlencoded({ extended: true }));

/* Evitar bloqueos en el navegador cuando estemos trabajando con el backend y el frontend a la vez */

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    optionSuccessStatus:200
}));

console.log(`api/${process.env.API_VERSION}/`);

app.use(`/api/${process.env.API_VERSION}/auth`, authRoutes);
app.use(`/api/${process.env.API_VERSION}/users`, userRoutes);
app.use(`/api/${process.env.API_VERSION}/events`, eventRoutes);
// app.use(`/api/${API_VERSION}/auth`, departamentoMunicipioRoutes);
// console.log(`/api/${API_VERSION}/datosabiertos`);

module.exports = app;
