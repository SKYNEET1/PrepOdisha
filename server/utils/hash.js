const bcrypt = require('bcrypt');

const hashPassword = async (password) => {

    try {

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        return passwordHash;

    } catch (error) {

        throw new Error("Error hashing password",error.message);

    }

};

const comparePassword = async (plainPassword, hashedPassword) => {

    try {

        return await bcrypt.compare(plainPassword, hashedPassword);

    } catch (error) {

        throw new Error("Error comparing password",error.message);

    }
    
}

module.exports = { hashPassword, comparePassword }