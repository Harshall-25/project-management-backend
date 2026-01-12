const express = require('express');
const projectRouter  = express.Router();
const {userAuth} = require('../middlewares/authmiddleware');
const {adminAuth} = require('../middlewares/isAdmin');
const {Project} = require('../schema');
const z = require('zod');

const projectSchema = z.object({
    title: z.string().min(1),
    description: z.string().min(1)
});

//post add projects (admin only)
projectRouter.post('/project',userAuth,adminAuth, async function(req,res){
    try {
        const validation = projectSchema.safeParse(req.body);
        if(!validation.success){
            return res.status(400).json({error: validation.error.errors});
        }
        const {title , description} = req.body;
        
        await Project.create({
            title : title,
            description : description,
            owner : req.user.id
        })

        res.status(201).json({
            message : "project is added"
        })
    } catch (error) {
        // Handle MongoDB duplicate key error
        if (error.code === 11000) {
            return res.status(409).json({ 
                error: "Duplicate project",
                details: "You already have a project with this title"
            });
        }
        res.status(500).json({ 
            error: "Internal server error",
            details: error.message
        });
    }
})
//get view all projects 
projectRouter.get('/project',userAuth,async function(req,res){
    try {
        let projects;

        //admin gets all the projects + authorization
        if(req.user.role === 'admin'){
            projects = await Project.find();
        }else{ 
            //if not admin gets projects the user owns or 
            //projects your are member offf
            projects = await Project.find({
                $or:[{owner:req.user.id},
                      {members : req.user.id}   
                    ]
            })
        }

        res.status(200).json({
            projects
        })
    } catch (error) {
        res.status(500).json({ 
            error: "Internal server error",
            details: error.message
        });
    }
})

//get view spefic project by id
projectRouter.get('/project/:id',userAuth,async function (req,res){
    try {
        const projectId = req.params.id;
        const project = await Project.findById(projectId);

        if(!project){
            return res.status(404).json({
                error : 'No project for this id'
            })
        }
        //if role admin access
        if(req.user.role === 'admin'){
            return res.status(200).json(project);
        }
        
        //check if owner or member belongs to project
        const isOwner = project.owner.toString() === req.user.id;
        const isMember = project.members?.includes(req.user.id);

        
        if(!isOwner && !isMember){
            return res.status(403).json({
                error : 'access denied'
            });
        }

        res.status(200).json(project);
    } catch (error) {
        res.status(500).json({ 
            error: "Internal server error",
            details: error.message
        });
    }
})


//delete the project by id (admin only)
projectRouter.delete('/project/:id',userAuth,adminAuth,async function(req,res){
    try {
        const projectId = req.params.id;
        
        const project = await Project.findById(projectId);

        if(!project){
            return res.status(404).json({
                message : 'project no available'
            });
        }

        await Project.findByIdAndDelete(projectId);

        res.status(200).json({
            message : 'project deleted'
        })
    } catch (error) {
        res.status(500).json({ 
            error: "Internal server error",
            details: error.message
        });
    }
})

module.exports ={
    projectRouter
}
