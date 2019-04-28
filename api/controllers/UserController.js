/**
 * UserController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const { sign, verify } = require('jsonwebtoken');
const jwtSecret = sails.config.secrets.jwtSecret;

const getRandomInt = function(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

module.exports = {
    /**
     * Register new user
     * @param req
     * @param res
     * @returns {Promise<*>}
     */
    async register(req, res) {
        const allowedParameters = [
            'email',
            'password',
            'username'
        ];

        const data = _.pick(req.body, allowedParameters);

        data.password = getRandomInt(9999999);
        const createdUser = await User
            .create(data)
            .fetch()
            .catch(err =>
                res.status(400).json(ErrorHandler(0, err.message))
            );

        const responseData = {
            user : createdUser,
            token: JwtService.issue({ id: createdUser.id })
        };

        return res.json(
            ResponseHandler(responseData)
        );
    },
    /**
     * Register new user
     * @param req
     * @param res
     * @returns {Promise<*>}
     */
    async profile(req, res) {
        const allowedParameters = [
            'username'
        ];

        const data = _.pick(req.allParams(), allowedParameters);
        const grabbedData = await User
            .findOne(data)
            .populate('userInfo')
            .fetch()
            .catch(err =>
                res.status(400).json(ErrorHandler(0, err.message))
            );

        return res.json(
            ResponseHandler(grabbedData)
        );
    },
    /**
     * Update user info
     * @param req
     * @param res
     * @returns {Promise.<void>}
     */
    async update(req, res){
        const allowedParameters = [
            'name',
            'gender',
            'weight',
            'height',
            'birth_date'
        ];


        const data = _.pick(req.allParams(), allowedParameters);
    },
    /**
     * Init user app
     * @param req
     * @param res
     * @returns {Promise.<void>}
     */
    async init(req, res){
        let token = req.headers.authorization;
        if (token) {
            if (token.startsWith('Bearer ')) {
                token = token.slice(7, token.length);
            }

            /**
             * Verify user jwt token and grab user
             */
            await verify(
                token,
                jwtSecret,
                async(err, data) => {
                    const grabbedUser = await User
                        .findOne({
                            id: data.id
                        })
                        .populate('UserBasicInfo')
                        .populate('UserPersonal');

                    res ? res.json(
                        ResponseHandler({ ...grabbedUser })
                    ) : 'wrong jwt token';
                }
            );
        } else {
            return res ? res.send(
                ErrorHandler(1002)
            ) : 'NoToken';
        }
    }

};
