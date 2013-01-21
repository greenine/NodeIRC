
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

exports.topicViewer = function(req, res){
  res.render('topicViewer', { title: 'Express' });
};