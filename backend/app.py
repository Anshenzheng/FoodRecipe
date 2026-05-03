from flask import Flask, request, jsonify
from flask_cors import CORS
from config import Config
from models import db, User, Category, Cuisine, Taste, Recipe, Ingredient, Step, Favorite, Comment
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import os

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)
db.init_app(app)

if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

@app.route('/')
def index():
    return jsonify({'message': '美食食谱分享平台 API'})

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': '用户名已存在'}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': '邮箱已存在'}), 400
    
    user = User(
        username=data['username'],
        email=data['email']
    )
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({'message': '注册成功', 'user': user.to_dict()}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data['username']).first()
    
    if user and user.check_password(data['password']):
        return jsonify({'message': '登录成功', 'user': user.to_dict()})
    
    return jsonify({'error': '用户名或密码错误'}), 401

@app.route('/api/categories', methods=['GET'])
def get_categories():
    categories = Category.query.order_by(Category.sort_order).all()
    return jsonify([cat.to_dict() for cat in categories])

@app.route('/api/categories', methods=['POST'])
def create_category():
    data = request.get_json()
    
    if Category.query.filter_by(name=data['name']).first():
        return jsonify({'error': '分类已存在'}), 400
    
    category = Category(
        name=data['name'],
        description=data.get('description', ''),
        icon=data.get('icon', ''),
        sort_order=data.get('sort_order', 0)
    )
    
    db.session.add(category)
    db.session.commit()
    
    return jsonify({'message': '分类创建成功', 'category': category.to_dict()}), 201

@app.route('/api/categories/<int:category_id>', methods=['PUT'])
def update_category(category_id):
    category = Category.query.get_or_404(category_id)
    data = request.get_json()
    
    category.name = data.get('name', category.name)
    category.description = data.get('description', category.description)
    category.icon = data.get('icon', category.icon)
    category.sort_order = data.get('sort_order', category.sort_order)
    
    db.session.commit()
    
    return jsonify({'message': '分类更新成功', 'category': category.to_dict()})

@app.route('/api/categories/<int:category_id>', methods=['DELETE'])
def delete_category(category_id):
    category = Category.query.get_or_404(category_id)
    
    db.session.delete(category)
    db.session.commit()
    
    return jsonify({'message': '分类删除成功'})

@app.route('/api/cuisines', methods=['GET'])
def get_cuisines():
    cuisines = Cuisine.query.all()
    return jsonify([c.to_dict() for c in cuisines])

@app.route('/api/cuisines', methods=['POST'])
def create_cuisine():
    data = request.get_json()
    
    if Cuisine.query.filter_by(name=data['name']).first():
        return jsonify({'error': '菜系已存在'}), 400
    
    cuisine = Cuisine(
        name=data['name'],
        description=data.get('description', '')
    )
    
    db.session.add(cuisine)
    db.session.commit()
    
    return jsonify({'message': '菜系创建成功', 'cuisine': cuisine.to_dict()}), 201

@app.route('/api/tastes', methods=['GET'])
def get_tastes():
    tastes = Taste.query.all()
    return jsonify([t.to_dict() for t in tastes])

@app.route('/api/tastes', methods=['POST'])
def create_taste():
    data = request.get_json()
    
    if Taste.query.filter_by(name=data['name']).first():
        return jsonify({'error': '口味已存在'}), 400
    
    taste = Taste(name=data['name'])
    
    db.session.add(taste)
    db.session.commit()
    
    return jsonify({'message': '口味创建成功', 'taste': taste.to_dict()}), 201

@app.route('/api/recipes', methods=['GET'])
def get_recipes():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    category_id = request.args.get('category_id', type=int)
    cuisine_id = request.args.get('cuisine_id', type=int)
    taste_id = request.args.get('taste_id', type=int)
    keyword = request.args.get('keyword', '')
    status = request.args.get('status', 'approved')
    
    query = Recipe.query
    
    if category_id:
        query = query.filter_by(category_id=category_id)
    if cuisine_id:
        query = query.filter_by(cuisine_id=cuisine_id)
    if taste_id:
        query = query.filter_by(taste_id=taste_id)
    if keyword:
        query = query.filter(
            (Recipe.title.contains(keyword)) | 
            (Recipe.description.contains(keyword))
        )
    if status:
        query = query.filter_by(status=status)
    
    pagination = query.order_by(Recipe.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'recipes': [r.to_dict() for r in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    })

@app.route('/api/recipes/<int:recipe_id>', methods=['GET'])
def get_recipe(recipe_id):
    recipe = Recipe.query.get_or_404(recipe_id)
    return jsonify(recipe.to_dict(include_details=True))

@app.route('/api/recipes', methods=['POST'])
def create_recipe():
    data = request.get_json()
    
    recipe = Recipe(
        title=data['title'],
        description=data.get('description', ''),
        cover_image=data.get('cover_image', ''),
        difficulty=data.get('difficulty', '中等'),
        cook_time=data.get('cook_time', ''),
        servings=data.get('servings', 2),
        category_id=data.get('category_id'),
        cuisine_id=data.get('cuisine_id'),
        taste_id=data.get('taste_id'),
        author_id=data.get('author_id'),
        status='pending'
    )
    
    db.session.add(recipe)
    db.session.flush()
    
    ingredients = data.get('ingredients', [])
    for idx, ing in enumerate(ingredients):
        ingredient = Ingredient(
            recipe_id=recipe.id,
            name=ing['name'],
            quantity=ing.get('quantity', ''),
            sort_order=idx
        )
        db.session.add(ingredient)
    
    steps = data.get('steps', [])
    for idx, step_data in enumerate(steps):
        step = Step(
            recipe_id=recipe.id,
            step_number=idx + 1,
            description=step_data['description'],
            image=step_data.get('image', '')
        )
        db.session.add(step)
    
    db.session.commit()
    
    return jsonify({'message': '食谱创建成功', 'recipe': recipe.to_dict()}), 201

@app.route('/api/recipes/<int:recipe_id>', methods=['PUT'])
def update_recipe(recipe_id):
    recipe = Recipe.query.get_or_404(recipe_id)
    data = request.get_json()
    
    recipe.title = data.get('title', recipe.title)
    recipe.description = data.get('description', recipe.description)
    recipe.cover_image = data.get('cover_image', recipe.cover_image)
    recipe.difficulty = data.get('difficulty', recipe.difficulty)
    recipe.cook_time = data.get('cook_time', recipe.cook_time)
    recipe.servings = data.get('servings', recipe.servings)
    recipe.category_id = data.get('category_id', recipe.category_id)
    recipe.cuisine_id = data.get('cuisine_id', recipe.cuisine_id)
    recipe.taste_id = data.get('taste_id', recipe.taste_id)
    
    if 'ingredients' in data:
        Ingredient.query.filter_by(recipe_id=recipe.id).delete()
        for idx, ing in enumerate(data['ingredients']):
            ingredient = Ingredient(
                recipe_id=recipe.id,
                name=ing['name'],
                quantity=ing.get('quantity', ''),
                sort_order=idx
            )
            db.session.add(ingredient)
    
    if 'steps' in data:
        Step.query.filter_by(recipe_id=recipe.id).delete()
        for idx, step_data in enumerate(data['steps']):
            step = Step(
                recipe_id=recipe.id,
                step_number=idx + 1,
                description=step_data['description'],
                image=step_data.get('image', '')
            )
            db.session.add(step)
    
    db.session.commit()
    
    return jsonify({'message': '食谱更新成功', 'recipe': recipe.to_dict()})

@app.route('/api/recipes/<int:recipe_id>/approve', methods=['POST'])
def approve_recipe(recipe_id):
    recipe = Recipe.query.get_or_404(recipe_id)
    recipe.status = 'approved'
    db.session.commit()
    
    return jsonify({'message': '食谱已批准', 'recipe': recipe.to_dict()})

@app.route('/api/recipes/<int:recipe_id>/reject', methods=['POST'])
def reject_recipe(recipe_id):
    recipe = Recipe.query.get_or_404(recipe_id)
    recipe.status = 'rejected'
    db.session.commit()
    
    return jsonify({'message': '食谱已拒绝', 'recipe': recipe.to_dict()})

@app.route('/api/recipes/<int:recipe_id>', methods=['DELETE'])
def delete_recipe(recipe_id):
    recipe = Recipe.query.get_or_404(recipe_id)
    
    db.session.delete(recipe)
    db.session.commit()
    
    return jsonify({'message': '食谱删除成功'})

@app.route('/api/favorites/<int:user_id>', methods=['GET'])
def get_favorites(user_id):
    favorites = Favorite.query.filter_by(user_id=user_id).order_by(Favorite.created_at.desc()).all()
    return jsonify([f.to_dict() for f in favorites])

@app.route('/api/favorites', methods=['POST'])
def add_favorite():
    data = request.get_json()
    user_id = data['user_id']
    recipe_id = data['recipe_id']
    
    if Favorite.query.filter_by(user_id=user_id, recipe_id=recipe_id).first():
        return jsonify({'error': '已收藏该食谱'}), 400
    
    favorite = Favorite(user_id=user_id, recipe_id=recipe_id)
    db.session.add(favorite)
    db.session.commit()
    
    return jsonify({'message': '收藏成功', 'favorite': favorite.to_dict()}), 201

@app.route('/api/favorites/<int:favorite_id>', methods=['DELETE'])
def remove_favorite(favorite_id):
    favorite = Favorite.query.get_or_404(favorite_id)
    
    db.session.delete(favorite)
    db.session.commit()
    
    return jsonify({'message': '取消收藏成功'})

@app.route('/api/comments/<int:recipe_id>', methods=['GET'])
def get_comments(recipe_id):
    comments = Comment.query.filter_by(recipe_id=recipe_id).order_by(Comment.created_at.desc()).all()
    return jsonify([c.to_dict() for c in comments])

@app.route('/api/comments', methods=['POST'])
def create_comment():
    data = request.get_json()
    
    comment = Comment(
        user_id=data['user_id'],
        recipe_id=data['recipe_id'],
        content=data['content'],
        rating=data.get('rating', 5)
    )
    
    db.session.add(comment)
    db.session.commit()
    
    return jsonify({'message': '评论成功', 'comment': comment.to_dict()}), 201

@app.route('/api/users/<int:user_id>/recipes', methods=['GET'])
def get_user_recipes(user_id):
    recipes = Recipe.query.filter_by(author_id=user_id).order_by(Recipe.created_at.desc()).all()
    return jsonify([r.to_dict() for r in recipes])

def init_db():
    with app.app_context():
        db.create_all()
        
        if not Category.query.first():
            categories = [
                Category(name='家常菜', description='简单易做的家常菜肴', sort_order=1),
                Category(name='主食', description='米饭、面条等主食', sort_order=2),
                Category(name='汤品', description='各种美味汤类', sort_order=3),
                Category(name='甜点', description='甜蜜可口的甜点', sort_order=4),
                Category(name='饮品', description='清爽解渴的饮品', sort_order=5)
            ]
            for cat in categories:
                db.session.add(cat)
        
        if not Cuisine.query.first():
            cuisines = [
                Cuisine(name='川菜', description='四川风味，麻辣鲜香'),
                Cuisine(name='粤菜', description='广东风味，清淡鲜美'),
                Cuisine(name='湘菜', description='湖南风味，酸辣可口'),
                Cuisine(name='鲁菜', description='山东风味，咸鲜为主'),
                Cuisine(name='苏菜', description='江苏风味，清鲜平和'),
                Cuisine(name='浙菜', description='浙江风味，鲜嫩软滑'),
                Cuisine(name='闽菜', description='福建风味，鲜香淡爽'),
                Cuisine(name='徽菜', description='安徽风味，咸鲜微辣')
            ]
            for c in cuisines:
                db.session.add(c)
        
        if not Taste.query.first():
            tastes = [
                Taste(name='咸鲜'),
                Taste(name='麻辣'),
                Taste(name='酸甜'),
                Taste(name='香辣'),
                Taste(name='清淡'),
                Taste(name='浓郁'),
                Taste(name='甜香'),
                Taste(name='酸辣')
            ]
            for t in tastes:
                db.session.add(t)
        
        if not User.query.filter_by(username='admin').first():
            admin = User(
                username='admin',
                email='admin@foodrecipe.com',
                is_admin=True
            )
            admin.set_password('admin123')
            db.session.add(admin)
        
        db.session.commit()
        print('数据库初始化完成！')

if __name__ == '__main__':
    init_db()
    app.run(debug=True, host='0.0.0.0', port=5000)
