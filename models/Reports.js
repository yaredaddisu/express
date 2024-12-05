const pool = require('../db');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const getAllTechniciansCount = async () => {
    try {
        const [result] = await pool.query(
            'SELECT COUNT(*) AS totalUsersCount FROM users'
        );
        return result[0].totalUsersCount;
    } catch (error) {
        console.error('Error fetching total user count:', error);
        throw new Error('Failed to fetch total user count');
    }
};
const getAllTasksCount = async () => {
    try {
        const [result] = await pool.query(
            'SELECT COUNT(*) AS totalTasksCount FROM jobs WHERE status = "1" '
        );
        return result[0].totalTasksCount;
    } catch (error) {
        console.error('Error fetching total tasks count:', error);
        throw new Error('Failed to fetch total tasks count');
    }
};
const getCanceledTasksCount = async () => {
    try {
        const [result] = await pool.query(
            'SELECT COUNT(*) AS canceledTasksCount FROM jobs WHERE status = "0"'
        );
        return result[0].canceledTasksCount;
    } catch (error) {
        console.error('Error fetching canceled tasks count:', error);
        throw new Error('Failed to fetch canceled tasks count');
    }
};
const getCompletedTasksCount = async () => {
    try {
        const [result] = await pool.query(
            'SELECT COUNT(*) AS completedTasksCount FROM jobs WHERE status = "2"'
        );
        return result[0].completedTasksCount;
    } catch (error) {
        console.error('Error fetching completed tasks count:', error);
        throw new Error('Failed to fetch completed tasks count');
    }
};
const getConfirmedTasksCount = async () => {
    try {
        const [result] = await pool.query(
            'SELECT COUNT(*) AS confirmedTasksCount FROM jobs WHERE status = "3"'
        );
        return result[0].confirmedTasksCount;
    } catch (error) {
        console.error('Error fetching confirmed tasks count:', error);
        throw new Error('Failed to fetch confirmed tasks count');
    }
};

const getTotalSalary = async () => {
    try {
        const [result] = await pool.query(
            'SELECT SUM(salary) AS totalSalary FROM jobs WHERE status = "2" ' // Adjust the query based on your schema
        );
        return result[0].totalSalary;
    } catch (error) {
        console.error('Error fetching total salary:', error);
        throw new Error('Failed to fetch total salary');
    }
};

const allCompletedPercentage = async () => {
    try {
        const [[{ totalJobs }]] = await pool.query(
            'SELECT COUNT(*) AS totalJobs FROM jobs'
        );

        const [[{ completedJobs }]] = await pool.query(
            'SELECT COUNT(*) AS completedJobs FROM jobs WHERE status = "2"'  // Corrected to use WHERE instead of AND
        );

        const percentageCompleted = totalJobs ? (completedJobs / totalJobs) * 100 : 0;
        return Math.round(percentageCompleted); // Return the rounded percentage
    } catch (error) {
        console.error('Error fetching tasks completed:', error);
        throw new Error('Failed to fetch tasks completed');
    }
};
const allJobsCount = async () => {
    try {
        const [result] = await pool.query(
            'SELECT COUNT(*) AS totalJobsCount FROM jobs'
        );
        return result[0].totalJobsCount;
    } catch (error) {
        console.error('Error fetching total user count:', error);
        throw new Error('Failed to fetch total user count');
    }
};

// const totalCompletedJobs = async (page, pageSize, search) => {
//     const offset = (page - 1) * pageSize;
//     const searchQuery = `%${search}%`;


//     // Query to fetch jobs along with technician details
//     const tasksQuery = `
//         SELECT jobs.*, CONCAT(users.firstName, ' ', users.lastName) AS technician_name,users.phone AS technician_phone , users.username AS technician_username , users.email AS technician_email 
//         FROM jobs
//         LEFT JOIN users ON jobs.technician_id = users.id
//         WHERE jobs.title LIKE ?
//         LIMIT ? OFFSET ?
//     `;

//     // Query to count the total number of jobs with search filter
//     const totalTasksQuery = `
//         SELECT COUNT(*) AS total FROM jobs
//         WHERE title LIKE ?
//     `;

//     try {
//         // Fetch tasks along with technician details
//         const [tasks] = await pool.query(tasksQuery, [searchQuery, pageSize, offset]);

//         // Fetch the total number of tasks matching the search criteria
//         const [total] = await pool.query(totalTasksQuery, [searchQuery]);

//         return { tasks, totalTasks: total[0].total };
//     } catch (error) {
//         throw new Error('Database Error: ' + error.message);
//     }
// };

const totalCompletedJobs = async (page, pageSize, search, filterByStatus, startDate, endDate) => {
    const offset = (page - 1) * pageSize;
    const searchQuery = `%${search}%`;

    let statusCondition = '';
    let dateRangeCondition = '';
    const params = [searchQuery, searchQuery];
    const totalParams = [...params];

    // Add filterByStatus if it's provided
    if (filterByStatus && filterByStatus.trim() !== '') {
        statusCondition = ' AND jobs.status = ?';
        params.push(filterByStatus);
        totalParams.push(filterByStatus);
    }

    // Only add date range if both startDate and endDate are provided
    if (startDate && endDate) {
        const formattedStartDate = new Date(startDate).toISOString().split('T')[0]; // Extract date part
        const formattedEndDate = new Date(endDate).toISOString().split('T')[0]; // Extract date part
        dateRangeCondition = ' AND DATE(jobs.created_at) BETWEEN ? AND ?'; // Use DATE() function for date comparison
        params.push(formattedStartDate, formattedEndDate);
        totalParams.push(formattedStartDate, formattedEndDate);
    }

    // Add pagination params only for the tasks query
    params.push(pageSize, offset);

    const tasksQuery = `
        SELECT jobs.*, CONCAT(users.firstName, ' ', users.lastName) AS technician_name,
               users.phone AS technician_phone, users.username AS technician_username,
               users.email AS technician_email
        FROM jobs
        LEFT JOIN users ON jobs.technician_id = users.id
        WHERE (jobs.title LIKE ? OR jobs.Reference LIKE ?)
              ${statusCondition} ${dateRangeCondition}
        ORDER BY jobs.created_at DESC
        LIMIT ? OFFSET ?
    `;

    const totalTasksQuery = `
        SELECT COUNT(*) AS total
        FROM jobs
        WHERE (title LIKE ? OR Reference LIKE ?)
              ${statusCondition} ${dateRangeCondition}
    `;

    try {
        console.log('Query Params:', params); // Log params to check values
        const [tasks] = await pool.query(tasksQuery, params);
        const [total] = await pool.query(totalTasksQuery, totalParams); // Use totalParams for count query

        return { tasks, totalTasks: total[0].total };
    } catch (error) {
        throw new Error('Database Error: ' + error.message);
    }
};


const importExcel = async (data) => {
    for (let row of data) {
      const {
        id, Reference, title, phone, company,
        description, location, salary, status: originalStatus,
        created_at, updated_at, user_id,
        technician_id, chat_id, latitude, longitude
      } = row;
  
      // Convert status to the desired format
      const status = 
        originalStatus === "In Progress" ? "1" :
        originalStatus === "Completed" ? "2" :
        originalStatus === "Confirmed" ? "3" :
        originalStatus === "Cancelled" ? "0" : "Unknown";
  
      const query = `
        INSERT INTO jobs (id, Reference, title, phone, company, description, location, salary, status, created_at, updated_at, user_id, technician_id, chat_id, latitude, longitude)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          Reference = VALUES(Reference),
          title = VALUES(title),
          phone = VALUES(phone),
          company = VALUES(company),
          description = VALUES(description),
          location = VALUES(location),
          salary = VALUES(salary),
          status = VALUES(status),
          created_at = VALUES(created_at),
          updated_at = VALUES(updated_at),
          user_id = VALUES(user_id),
          technician_id = VALUES(technician_id),
          chat_id = VALUES(chat_id),
          latitude = VALUES(latitude),
          longitude = VALUES(longitude)
      `;
  
      await pool.query(query, [
        id, Reference, title, phone, company,
        description, location, salary, status,
        created_at, updated_at, user_id,
        technician_id, chat_id, latitude, longitude
      ]);
    }
  };
 
module.exports = {
    getAllTechniciansCount,
    getConfirmedTasksCount,
    getCompletedTasksCount,
    getCanceledTasksCount,
    getAllTasksCount,
    getTotalSalary,
    allCompletedPercentage,
    allJobsCount,
    totalCompletedJobs,
    importExcel
};


