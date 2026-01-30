import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, "..", "oracle.db");

// Using verbose mode for debugging
const db = new sqlite3.Database(DB_PATH);

export function getAllMarkets(): Promise<any[]> {
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM markets`;
        db.all(query, [], (err, rows) => {
            if (err) {
                console.error("❌ Error fetching all markets:", err.message);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

export function initDb(): void {
    const query = `
    CREATE TABLE IF NOT EXISTS markets (
        market_id TEXT PRIMARY KEY,
        deadline INTEGER,
        threshold REAL,
        status TEXT DEFAULT 'pending',
        metric_type TEXT DEFAULT 'eth_staking_rate',
        description TEXT,
        total_staked INTEGER DEFAULT 0,
        option_a_stakes INTEGER DEFAULT 0,
        option_b_stakes INTEGER DEFAULT 0
    )
    `;
    db.run(query, (err) => {
        if (err) {
            console.error("❌ Database initialization error:", err.message);
        } else {
            console.log("📦 Database initialized successfully.");
        }
    });
}

export function addMarket(
    marketId: string,
    deadline: number,
    threshold: number,
    metricType: string = "eth_staking_rate",
    description: string = ""
): void {
    const query = `
    INSERT OR REPLACE INTO markets (market_id, deadline, threshold, status, metric_type, description)
    VALUES (?, ?, ?, 'pending', ?, ?)
    `;
    db.run(query, [marketId, deadline, threshold, metricType, description], (err) => {
        if (err) {
            console.error(`❌ Error adding market ${marketId}:`, err.message);
        } else {
            console.log(`📝 Market ${marketId} added to DB (Metric: ${metricType}).`);
        }
    });
}

export function getPendingMarkets(): Promise<any[]> {
    return new Promise((resolve, reject) => {
        const query = `SELECT market_id, deadline, threshold, metric_type FROM markets WHERE status = 'pending'`;
        db.all(query, [], (err, rows) => {
            if (err) {
                console.error("❌ Error fetching pending markets:", err.message);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

export function getLockedMarkets(): Promise<any[]> {
    return new Promise((resolve, reject) => {
        const query = `SELECT market_id, deadline, threshold, metric_type FROM markets WHERE status = 'locked'`;
        db.all(query, [], (err, rows) => {
            if (err) {
                console.error("❌ Error fetching locked markets:", err.message);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

export function markLocked(marketId: string): void {
    const query = `UPDATE markets SET status = 'locked' WHERE market_id = ?`;
    db.run(query, [marketId], (err) => {
        if (err) {
            console.error(`❌ Error marking market ${marketId} as locked:`, err.message);
        } else {
            console.log(`🔒 Market ${marketId} marked as locked in DB.`);
        }
    });
}

export function markResolved(marketId: string): void {
    const query = `UPDATE markets SET status = 'resolved' WHERE market_id = ?`;
    db.run(query, [marketId], (err) => {
        if (err) {
            console.error(`❌ Error marking market ${marketId} as resolved:`, err.message);
        } else {
            console.log(`✅ Market ${marketId} marked as resolved in DB.`);
        }
    });
}

export function updateMarketStats(
    marketId: string,
    totalStaked: number,
    optionAStakes: number,
    optionBStakes: number
): void {
    const query = `
    UPDATE markets 
    SET total_staked = ?, option_a_stakes = ?, option_b_stakes = ? 
    WHERE market_id = ?
    `;
    db.run(query, [totalStaked, optionAStakes, optionBStakes, marketId], (err) => {
        if (err) {
            console.error(`❌ Error updating stats for market ${marketId}:`, err.message);
        } else {
            console.log(`📊 Updated on-chain stats for market ${marketId}.`);
        }
    });
}
