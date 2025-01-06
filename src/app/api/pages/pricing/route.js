/**
 * ! We haven't used this file in our template. We've used the server actions in the
 * ! `src/app/server/actions.ts` file to fetch the static data from the fake-db.
 * ! This file has been created to help you understand how you can create your own API routes.
 * ! Only consider making API routes if you're planing to share your project data with other applications.
 * ! else you can use the server actions or third-party APIs to fetch the data from your database.
 */
// Next Imports
import { NextResponse } from 'next/server'

// Data Imports
// import { db } from '@/fake-db/pages/pricing'
import db from '../../../../configs/db'

export async function GET() {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM your_table_name', (err, results) => {
      if (err) {
        return reject(NextResponse.json({ error: "Database query failed" }, { status: 500 }));
      }
      return resolve(NextResponse.json(results));
    });
  });
}
