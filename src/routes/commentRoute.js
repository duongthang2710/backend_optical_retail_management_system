const express = require("express");

const commentController = require("../controllers/commentController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const {
    validateCommentIdParam,
    validateVariantIdParam,
    validateCreateComment,
    validateUpdateComment,
} = require("../validators/commentValidator");

const router = express.Router();

router.get(
    "/variants/:variantId/comments",
    validateVariantIdParam,
    commentController.listByVariant,
);
router.get(
    "/comments/:id",
    validateCommentIdParam,
    commentController.getById,
);

router.post(
    "/comments",
    authMiddleware,
    validateCreateComment,
    commentController.createComment,
);

router.put(
    "/comments/:id",
    authMiddleware,
    validateCommentIdParam,
    validateUpdateComment,
    commentController.updateComment,
);

router.delete(
    "/comments/:id",
    authMiddleware,
    validateCommentIdParam,
    commentController.deleteComment,
);

module.exports = router;
