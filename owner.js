const Ok = {
    Result: true
};
const Not = {
    Result: false
};
const multer = require('multer');
const upload = multer({ dest: 'public/uploads/' });
const auth=require('./auth');
const sql=require('./sql');
exports.startOwner=(app)=> {
 // owner
 app.get('/Owner', (req, res)=>{
     const user=auth.getUser(req);
     var start=req.query.start;
     var end;
     
     if(!start) {
        var date=new Date();
        start=date.getFullYear()+'-';
        if(date.getMonth()<9) {
            start+='0';
        }
        start+=(date.getMonth()+1)+'-01';
     }
     var endDate=new Date(start);
     var month=endDate.getMonth()+1;
     endDate.setMonth(month);
     
     end=endDate.getFullYear()+'-';
     if(endDate.getMonth()<9) {
         end+='0';
     }
     end+=(endDate.getMonth()+1)+'-01';
     if(user.userID) {
        sql.getOwnerFee(start, end, null, user.userID, (cnt)=>{
            sql.getOwnerCnt(user.userID, start, end, (table)=>{
                res.render('./Owner/index', {user:user, cnt:cnt, table:table, start:start});
            })
        });
     } else {
         res.redirect('/');
     }
    
 });
 app.get('/Owner/ItemList', (req, res)=> {
    const user=auth.getUser(req); 
    var yyyymm=req.query.yymm;
    if(user.userID) {
        if(!yyyymm) {
            const date=new Date();
            yyyymm=date.getFullYear()+'-'+(date.getMonth()+1);
        }
        sql.getItemList(user.userID, yyyymm, (results)=>{
            var endDate=new Date(yyyymm+'-01');
            var endMonth=endDate.getMonth()+1;
            endDate.setMonth(endMonth);
            var end=endDate.getFullYear()+'-';
            if(endMonth<10) {
                end+='0';
            }
            end+=(endDate.getMonth()+1)+'-01';
            
            sql.getOwnerCnt(user.userID, yyyymm+'-01', end, (table)=>{
                res.render('./Owner/itemList', {user: user, itemList:results, yyyymm:yyyymm, table:table});
            });
            
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
    const path=__dirname+'/'+req.file.path;
    let workbook=xlsx.readFile(path);
    let sheetName=workbook.SheetNames[0];
    let worksheet=workbook.Sheets[sheetName];
    const sheetJson=xlsx.utils.sheet_to_json(worksheet);
    res.json(sheetJson);
}); 
}