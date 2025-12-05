import { Request, Response } from "express";
import { asyncHandler } from "@middleware/errorHandler";
import { TagProposalService } from "./TagProposalService";
import { AuthenticatedRequest } from "@middleware/auth";

export class TagProposalController {
  constructor(private readonly tagProposalService = new TagProposalService()) {}

  createForPattern = asyncHandler(async (req: Request, res: Response) => {
    const request = req as AuthenticatedRequest;
    const proposal = await this.tagProposalService.create(request.user!.id, req.params.patternId, req.body);
    res.status(201).json({ success: true, data: proposal });
  });

  listForPattern = asyncHandler(async (req: Request, res: Response) => {
    const request = req as AuthenticatedRequest;
    const proposals = await this.tagProposalService.listForPattern(req.params.patternId, request.user!.id);
    res.json({ success: true, data: proposals });
  });

  listPending = asyncHandler(async (_req: Request, res: Response) => {
    const proposals = await this.tagProposalService.listPending();
    res.json({ success: true, data: proposals });
  });

  approve = asyncHandler(async (req: Request, res: Response) => {
    const request = req as AuthenticatedRequest;
    const proposal = await this.tagProposalService.approve(req.params.proposalId, request.user!.id);
    res.json({ success: true, data: proposal });
  });

  reject = asyncHandler(async (req: Request, res: Response) => {
    const request = req as AuthenticatedRequest;
    const proposal = await this.tagProposalService.reject(req.params.proposalId, request.user!.id);
    res.json({ success: true, data: proposal });
  });
}

export const tagProposalController = new TagProposalController();
