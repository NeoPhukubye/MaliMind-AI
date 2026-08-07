from fastapi import APIRouter
from app.schemas.schemas import CoachRequest, CoachResponse
from app.services.ai_service import get_coach_response

router = APIRouter()


@router.post("/coach", response_model=CoachResponse)
async def coach(req: CoachRequest):
    response = await get_coach_response(req.message, req.history)
    return CoachResponse(response=response)
