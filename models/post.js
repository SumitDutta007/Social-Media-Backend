const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./user");

const Post = sequelize.define(
  "Post",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    desc: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [0, 500],
      },
    },
    img: {
      type: DataTypes.STRING(500), // Increased to 500 to handle long Cloudinary URLs
      allowNull: true,
    },
    likes: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      defaultValue: [],
    },
    dislikes: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      defaultValue: [],
    },
    comments: {
      type: DataTypes.ARRAY(DataTypes.JSON),
      defaultValue: [],
    },
  },
  {
    timestamps: true,
    tableName: "posts",
  }
);

// Define associations
Post.belongsTo(User, { foreignKey: "userId", as: "author" });
User.hasMany(Post, { foreignKey: "userId", as: "posts" });

module.exports = Post;
