const express = require('express')
const dotenv = require('dotenv')
const mssql = require('mssql')
var cors = require('cors')

const app = express();
const router = express.Router();

app.use(cors())
dotenv.config();

const config = {
    driver: process.env.SQL_DRIVER,
    server: process.env.SQL_SERVER,
    port: parseInt(process.env.SQL_PORT),
    database: process.env.SQL_DATABASE,
    user: process.env.SQL_UID,
    password: process.env.SQL_PWD,
    options: {
        encrypt: false,
        enableArithAbort: false
    },
};

 //console.log("DB_HOST:", process.env.SQL_DRIVER);
 //console.log("DB_HOST:", process.env.SQL_SERVER);
 //console.log("DB_HOST:", process.env.SQL_PORT);
 //console.log("DB_HOST:", process.env.SQL_DATABASE);
 //console.log("DB_HOST:", process.env.SQL_UID);

const pool = new mssql.ConnectionPool(config);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
    res.send('?? Teaming up with NodeJS and SQL Server');
});

app.get('/isMobile', (req, res) => {
    if (navigator.userAgent.includes('Mozilla') || navigator.userAgent.includes('Opera')) {
        res.send(false);
    } else {
        res.send(true);
    }    
});

app.get('/apwork2023', async (req, res) => {
    // 정상적으로 동작하는지 확인하기 위한 테스트...
    res.send('1234');

    try {
        await pool.connect();
        
        const result = await pool.request()
            //.query(`select @@version`);
            .query(`SELECT ConName  FROM tbl_APWork`);
        const posts = result.recordset;
        console.log(res.json(posts));
        if (posts) {
            
            return res.json(posts);
            
        } else {
            return res.status(404).json({
                message: 'Record not found'
            });
        }      
     
     } catch (error) {
         return res.status(500).json(error);
    }        
});

//작업현황 가져오기
app.get('/apwork2023/:worker', async (req, res) => {
    // SP 수정해야 함;;;;
    const { worker } = req.params

    try {
        await pool.connect();
        
        const result = await pool.request()
            .input('worker', mssql.VarChar, worker)
            .execute(`dbo.SP_GetStatus`);
        const posts = result.recordset;

        
        if (posts) {
            return res.json(posts);
        } else {
            return res.status(404).json({
                message: 'Record not found'
            });
        }      
             
    } catch (error) {
        console.log(error)
        return res.status(500).json(error);        
    }    
});

//AP공사현황 가져오기
app.get('/apwork2023/ConStatus/:ConDiv/:B_Stat/:W_Regist', async (req, res) => {
    // SP 수정해야 함;;;;
    const { ConDiv } = req.params
    const { B_Stat } = req.params
    const { W_Regist } = req.params

    try {
        await pool.connect();
        
        
        const result = await pool.request()
        .input('ConDiv', mssql.VarChar, ConDiv)
        .input('B_Stat', mssql.VarChar, B_Stat)
        .input('W_Regist', mssql.VarChar, W_Regist)
        .execute(`dbo.SP_GetAPList_4web_New`);
        const posts = result.recordset;

        
        if (posts) {
            return res.json(posts);
        } else {
            return res.status(404).json({
                message: 'Record not found'
            });
        }      
             
    } catch (error) {
        console.log(error)
        return res.status(500).json(error);        
    }    
});

app.get('/apwork2023/:worker/:B_Stat', async (req, res) => {
    // ./apwork2023/:worker/:status로 접속하면 시공업체, B_Stat 별로 리스트 업
    // status = ALL, 전부표시
    const { worker } = req.params
    const { B_Stat } = req.params

    try {
        await pool.connect();
        
        const result = await pool.request()
            .input('worker', mssql.VarChar, worker)
            .input('B_Stat', mssql.VarChar, B_Stat)
            .execute(`dbo.SP_GetAPList_4web`);
        const posts = result.recordset;

        if (posts) {
            return res.json(posts);
        } else {
            return res.status(404).json({
                message: 'Record not found'
            });
        }           
        
    } catch (error) {
        console.log(error)
        return res.status(500).json(error);        
    }    
});

app.listen(process.env.PORT, () => {
    console.log(`Server started running on ${process.env.PORT} for ${process.env.NODE_ENV}`);
});