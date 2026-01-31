# DB Migrations

We use `sequelize.sync({ alter: true })` for lightweight migrations in development.
For production, replace with proper Sequelize CLI migrations or a migration tool.
