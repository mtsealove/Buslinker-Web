exports.getUser=(req)=>{
    var id = req.session.userID;
    var name = req.session.userName;
    var cat = req.session.userCat;
    var profile = req.session.profile;
    if (!id) {
        id = '';
        cat = '';
        name = '';
        profile = '';
    }
    const info = {
        userID: id,
        userName: name,
        userCat: cat,
        profile: profile
    }
    return info;
}