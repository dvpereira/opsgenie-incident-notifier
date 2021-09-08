//require('source-map-support').install();
import { configureApp } from './app'
import { createServer, proxy } from 'aws-serverless-express';
import { Context } from 'aws-lambda';


const binaryMimeTypes: string[] = [
    // 'application/javascript',
    // 'application/json',
    // 'application/octet-stream',
    // 'application/xml',
    // 'font/eot',
    // 'font/opentype',
    // 'font/otf',
    // 'image/jpeg',
    // 'image/png',
    // 'image/svg+xml',
    // 'text/comma-separated-values',
    // 'text/css',
    // 'text/html',
    // 'text/javascript',
    // 'text/plain',
    // 'text/text',
    // 'text/xml',
  ];

const app = configureApp()
const server = createServer(app, undefined, binaryMimeTypes)

//server.listen(3333)

export const http = (event:any, context: Context) =>
  proxy(server, event, context)