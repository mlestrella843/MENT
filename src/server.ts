import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import { config } from './config/config';

const router = express();

//** Connect to Mongoose */
mongoose
    .connect(config.mongo.url, { retryWrites: true, w: 'majority' })
    .then(() => {
        console.log('conected');
    })
    .catch((error) => {
        console.log(error);
    });
