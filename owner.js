const Ok = {
    Result: true
};
const Not = {
    Result: false
};
const multer = require('multer');
const upload = multer({ dest: 'public/uploads/' });
const auth=require('./auth');
exports.startOwner=(app, sql)=> {
 // owner
 app.get('/Owner/ItemList', (req, res)=> {
    const user=auth.getUser(req); 
    var yyyymm=req.query.yymm;
    if(user.userID) {
        if(!yyyymm) {
            const date=new Date();
            yyyymm=date.getFullYear()+'-'+(date.getMonth()+1);
        }
        sql.getItemList(user.userID, yyyymm, (results)=>{
            console.log(results);
            res.render('./Owner/itemList', {user: user, itemList:results, yyyymm:yyyymm});
        });    
    } else {
        res.redirect('/');
    }
});

// post item 
app.post('/Owner/Create/ItemList', (req, res)=> {
    const user=auth.getUser(req);
    const ids=req.body['id'];
    const phones=req.body['phone'];
    const names=req.body['name'];
    const item_names=req.body['item_name'];
    const addrs=req.body['addr'];

    sql.createItemList(user.userID, ids, item_names, names, phones, addrs, (result)=> {
        if(result) {
            console.log('success');
            res.send(`<script>alert('물량이 등록되었습니다.');location.href='/Owner/ItemList';</script>`);
        } else {
            res.send(`<script>alert('오류가 발생하였습니다.');history.go(-1);</script>`);
        }
    })
});

// get item list by ajax
app.get('/Onwer/Get/ItemList', (req, res)=> {
    const listID=req.query.listID;
    const user=auth.getUser(req);
    
    if(user.userID) {
        sql.getItemListDetail(user.userID, listID, (result)=> {
            if(result) {
                res.json(result);
            } 
        }); 
    } else {
        res.redirect('/');
    }
});

const xlsx=require('xlsx');
app.post('/Owner/Upload/Excel', upload.single('item_file'), (req, res)=> {
    console.log(req.file);
    const path=__dirname+'/'+req.file.path;
    let workbook=xlsx.readFile(path);
    let sheetName=workbook.SheetNames[0];
    let worksheet=workbook.Sheets[sheetName];
    const sheetJson=xlsx.utils.sheet_to_json(worksheet);
    console.log(sheetJson);
    res.json(sheetJson);
}); 
}