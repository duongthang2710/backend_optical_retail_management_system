const sequelize = require("sequelize");
const { DataTypes } = require("sequelize");

const User = sequelize.define(
    "User",
    {
        user_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        user_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
        },
        user_password: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        full_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
        },
        phone_number: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        password_hash: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        role: {
            type: DataTypes.ENUM("customer", "admin"),
            allowNull: false,
            defaultValue: "customer",
        },
        refresh_token: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        reset_otp_hash: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        reset_otp_expires_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        sequelize,
        moduleName: "User",
        tableName: "users",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

User.associate = (models) => {
    User.hasMany(models.UserAddress, { foreignKey: "user_id", as: "user_addresses" });
};

module.exports = {
    User,
};  

// Code theo mot kieu 

// const crypto = require("crypto");

// const usersById = new Map();
// const emailToUserId = new Map();

// const cloneUser = (user) => {
//   if (!user) {
//     return null;
//   }

//   return {
//     ...user,
//   };
// };

// const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

// const generateUserId = () => `usr_${crypto.randomBytes(8).toString("hex")}`;

// const touchUser = (user) => {
//   user.updatedAt = new Date();
// };

// const findUserByEmail = (email) => {
//   const normalizedEmail = normalizeEmail(email);
//   const userId = emailToUserId.get(normalizedEmail);

//   if (!userId) {
//     return null;
//   }

//   return cloneUser(usersById.get(userId));
// };

// const findUserById = (userId) => {
//   return cloneUser(usersById.get(userId));
// };

// const createUser = ({ fullName, email, phone, passwordHash, role = "customer" }) => {
//   const normalizedEmail = normalizeEmail(email);
//   const userId = generateUserId();
//   const now = new Date();

//   const user = {
//     id: userId,
//     fullName,
//     email: normalizedEmail,
//     phone_number: phone,
//     passwordHash,
//     role,
//     refreshToken: null,
//     resetOtpHash: null,
//     resetOtpExpiresAt: null,
//     createdAt: now,
//     updatedAt: now,
//   };

//   usersById.set(userId, user);
//   emailToUserId.set(normalizedEmail, userId);

//   return cloneUser(user);
// };

// const updateUserRefreshToken = (userId, refreshToken) => {
//   const user = usersById.get(userId);
//   if (!user) {
//     return null;
//   }

//   user.refreshToken = refreshToken || null;
//   touchUser(user);

//   return cloneUser(user);
// };

// const clearUserRefreshToken = (userId) => updateUserRefreshToken(userId, null);

// const storePasswordResetOtp = (userId, { otpHash, expiresAt }) => {
//   const user = usersById.get(userId);
//   if (!user) {
//     return null;
//   }

//   user.resetOtpHash = otpHash;
//   user.resetOtpExpiresAt = expiresAt;
//   touchUser(user);

//   return cloneUser(user);
// };

// const clearPasswordResetOtp = (userId) => {
//   const user = usersById.get(userId);
//   if (!user) {
//     return null;
//   }

//   user.resetOtpHash = null;
//   user.resetOtpExpiresAt = null;
//   touchUser(user);

//   return cloneUser(user);
// };

// const updateUserPassword = (userId, passwordHash) => {
//   const user = usersById.get(userId);
//   if (!user) {
//     return null;
//   }

//   user.passwordHash = passwordHash;
//   touchUser(user);

//   return cloneUser(user);
// };

// module.exports = {
//   findUserByEmail,
//   findUserById,
//   createUser,
//   updateUserRefreshToken,
//   clearUserRefreshToken,
//   storePasswordResetOtp,
//   clearPasswordResetOtp,
//   updateUserPassword,
// };
