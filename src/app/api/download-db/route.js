import { registerData, responseData } from '@/utils/message';
import mysql from 'mysql2/promise';
import { NextResponse } from 'next/server';
import { PrismaClient } from "@prisma/client";
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

export async function POST(request) {
    try {
        const body = await request.json();
        const { dbHostName, dbName, dbUserName, dbPassword } = body;
        let jwtToken = body?.token;
        const token = jwt.verify(jwtToken, process.env.JWT_SECRET).userDetail;
        if (!token) {
            return NextResponse.json({ result: false, message: { tokenExpired: responseData.tokenExpired } });
        }
        const user = await prisma.user.findUnique({ where: { id: token.id, isDeleted: "N" } });
        if (!user) {
            return NextResponse.json({ result: false, message: { userNotFound: responseData.userNotFound } });
        }
        const emptyFieldErrors = {};
        if (!dbHostName || dbHostName?.trim() === "") {
            emptyFieldErrors.dbHostName = registerData.dbHostNameReq;
        }
        if (!dbName || dbName?.trim() === "") {
            emptyFieldErrors.dbName = registerData.dbNameReq;
        }
        if (!dbUserName || dbUserName?.trim() === "") {
            emptyFieldErrors.dbUserName = registerData.dbUserNameReq;
        }
        // if (!dbPassword || dbPassword?.trim() === "") {
        //     emptyFieldErrors.dbPassword = registerData.dbPasswordReq;
        // }
        if (Object.keys(emptyFieldErrors).length > 0) {
            return NextResponse.json({ result: false, message: emptyFieldErrors }, {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        } else {
            const conn = await mysql.createConnection({
                host: dbHostName,
                user: dbUserName,
                password: dbPassword,
                database: dbName
            });
            await conn.ping();
            const getCreateTableStatement = async (tableName) => {
                return conn.query(`SHOW CREATE TABLE ${tableName}`).then(([createTable]) => createTable[0]?.['Create Table'] ?? '');
            };
            const getInsertStatements = async (tableName) => {
                const [rows] = await conn.query(`SELECT * FROM ${tableName}`);
                const [tableInfo] = await conn.query(`DESCRIBE ${tableName}`);
                return rows.map(row => {
                    const columns = tableInfo.map(info => info.Field);
                    const values = columns.map(col => {
                        const value = row[col];
                        if (value === null || value === undefined) {
                            return 'NULL';
                        } else if (typeof value === 'string') {
                            return `'${value.replace(/'/g, "''")}'`;
                        } else if (value instanceof Date) {
                            return `'${value.toISOString().replace('T', ' ').replace('Z', '')}'`;
                        } else {
                            return String(value);
                        }
                    });
                    return `INSERT INTO \`${tableName}\` (\`${columns.join('`, `')}\`) VALUES (${values.join(', ')});`;
                }).join('\n');
            };
            const dump = await conn.query('SHOW TABLES').then(async ([tables]) => {
                const tableKey = `Tables_in_${dbName}`
                const tableNames = tables.map(table => table[tableKey]);
                const dumpPromises = tableNames.map(async tableName => {
                    let createTableSql = await getCreateTableStatement(tableName);
                    if (!createTableSql.endsWith(';')) {
                        createTableSql += ';';
                    }
                    const insertStatements = await getInsertStatements(tableName);
                    return `${createTableSql}\n\n${insertStatements}`;
                });
                return Promise.all(dumpPromises).then(results => results.join('\n\n'));
            });
            await conn.end();
            const response = new NextResponse(dump, {
                status: 200,
                headers: {
                    'Content-Type': 'text/plain',
                    'Content-Disposition': `attachment; filename=${dbName}_full_dump.sql`,
                },
            });
            return response;
        }
    } catch (error) {
        // if (error.code === 'ECONNREFUSED' || error.code === 'ER_ACCESS_DENIED_ERROR') {
        //     return new NextResponse(JSON.stringify({ error: 'Invalid database credentials. Please check your database configuration.' }), {
        //         status: 401,
        //         headers: {
        //             'Content-Type': 'application/json',
        //         },
        //     });
        // } else {
        //     return new NextResponse(JSON.stringify({ error: 'An unexpected error occurred: ' + error.message }), {
        //         status: 401,
        //         headers: {
        //             'Content-Type': 'application/json',
        //         },
        //     });
        // }
        return new NextResponse(JSON.stringify({ error: 'An unexpected error occurred: ' + error.message }), {
            status: 401,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}
