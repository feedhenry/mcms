db = connect("localhost/cms");

printjson(db.dropDatabase());

db = connect("localhost/cms");

print("using database cms");

print("creating collections...");

print("creating users, this stores the user accounts for accessing the cms portal...");

printjson(db.createCollection("users"));

print("creating user indexes...");

db.users.ensureIndex({
	"username" : 1
}, {
	unique : true,
	dropDups : true
});

db.users.ensureIndex({
	"email" : 1
}, {
	unique : true,
	dropDups : true
});

printjson(db.users.getIndexes());

print("inserting test user document...");

db.users.insert({
	"email" : "test@test.com",
	"name" : "test user",
	"password" : "test",
	"username" : "test"
});

db.users.find().forEach(function(user) {
	printjson(user);
});

print("creating categories...");

printjson(db.createCollection("categories"));

print("creating category indexes...");

db.categories.ensureIndex({
	"alias" : 1
}, {
	unique : true,
	dropDups : true
});

printjson(db.categories.getIndexes());

print("inserting test category documents...");

[ {
	"alias" : "cat1",
	"name" : "Category 1",
	"publish" : true,
	"version" : 1, 
	"apps": [],
	"categories": []
}, {
	"alias" : "cat1.1",
	"name" : "Category 1.1",
	"publish" : true,
	"version" : 1,
	"apps": [],
	"categories": []
}, {
	"alias" : "cat1.1.1",
	"name" : "Category 1.1.1",
	"publish" : true,
	"version" : 1,
	"apps": [],
	"categories": []
}, {
	"alias" : "cat2",
	"name" : "Category 2",
	"publish" : true,
	"version" : 1,
	"apps": [],
	"categories": []
}, {
	"alias" : "cat2.1",
	"name" : "Category 2.1",
	"publish" : true,
	"version" : 1,
	"apps": [],
	"categories": []
}, {
	"alias" : "cat3",
	"name" : "Category 3",
	"publish" : true,
	"version" : 1,
 "apps": [],
 "categories": []
} ].forEach(function(item){
	db.categories.insert(item);
});


db.categories.find().forEach(function(category) {
	printjson(category);
});

print("creating articles...");

printjson(db.createCollection("articles"));

print("creating article indexes...");

db.articles.ensureIndex({
	"alias" : 1
}, {
	unique : true,
	dropDups : true
});

printjson(db.articles.getIndexes());

print("inserting test article documents...");

[ {
	"alias" : "art1",
	"content" : "",
	"name" : "Article 1",
	"publish" : true,
	"type" : "web",
	"version" : 1,
	"apps": [],
	"categories": []
}, {
	"alias" : "art2",
	"content" : "",
	"name" : "Article 2",
	"publish" : true,
	"type" : "web",
	"version" : 1,
	"apps": [],
	"categories": []
}, {
	"alias" : "art3",
	"content" : "",
	"name" : "Article 3",
	"publish" : true,
	"type" : "web",
	"version" : 1,
 "apps": [],
 "categories": []
} ].forEach(function(item){
	db.articles.insert(item);
});
db.articles.find().forEach(function(article) {
	printjson(article);
});

print("creating apps, this stores the content tree for the different apps under the cms...");
print("note, branches must start with a category and end with an article...");

printjson(db.createCollection("apps"));

print("creating app indexes...");

db.apps.ensureIndex({
	"alias" : 1
}, {
	unique : true,
	dropDups : true
});

printjson(db.apps.getIndexes());

print("inserting test app documents...");

db.apps.remove();
db.apps.insert({ "alias" : "dublin", "name" : "Dublin Airport", "publish" : "true", "root" : {}, "version" : 6 } )

db.apps.find().forEach(function(app) {
	printjson(app);
});