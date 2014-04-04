module.exports = {
    loadIndex: loadIndex
};

function loadIndex(req, res) {
    res.render("dashboard/index", {
        title: "Dashboard",
        sessionUser: req.session.user
    });
}