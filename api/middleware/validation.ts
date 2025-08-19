import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// User validation rules
export const validateUserRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('username')
    .isLength({ min: 3, max: 30 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username must be 3-30 characters and contain only letters, numbers, and underscores'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('firstName')
    .isLength({ min: 1, max: 50 })
    .trim()
    .withMessage('First name is required and must be less than 50 characters'),
  body('lastName')
    .isLength({ min: 1, max: 50 })
    .trim()
    .withMessage('Last name is required and must be less than 50 characters'),
  handleValidationErrors
];

export const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Squad validation rules
export const validateSquadCreation = [
  body('name')
    .isLength({ min: 3, max: 100 })
    .trim()
    .withMessage('Squad name must be 3-100 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .trim()
    .withMessage('Description must be less than 500 characters'),
  body('game')
    .isLength({ min: 1, max: 100 })
    .trim()
    .withMessage('Game is required'),
  handleValidationErrors
];

// Tournament validation rules
export const validateTournamentCreation = [
  body('name')
    .isLength({ min: 3, max: 200 })
    .trim()
    .withMessage('Tournament name must be 3-200 characters'),
  body('game')
    .isLength({ min: 1, max: 100 })
    .trim()
    .withMessage('Game is required'),
  body('format')
    .isIn(['single_elimination', 'double_elimination', 'round_robin', 'swiss'])
    .withMessage('Invalid tournament format'),
  body('maxParticipants')
    .isInt({ min: 2, max: 1000 })
    .withMessage('Max participants must be between 2 and 1000'),
  body('prizePool')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Prize pool must be a positive number'),
  body('registrationDeadline')
    .isISO8601()
    .withMessage('Valid registration deadline is required'),
  body('startDate')
    .isISO8601()
    .withMessage('Valid start date is required'),
  handleValidationErrors
];