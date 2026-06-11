from agent.risk_engine import calculate_risk
from agent.alert_engine import generate_alert, send_alert_email
from agent.action_engine import take_action
from database import save_transaction_record

async def run_agent_workflow(transaction):

    risk_result = calculate_risk(transaction)

    alert_result = generate_alert(
        risk_result,
        transaction
    )

    action_result = take_action(
        risk_result
    )

    await send_alert_email(alert_result)
    
    workflow_result = {
    "transaction": transaction,
    "risk_analysis": risk_result,
    "alert": alert_result,
    "action": action_result
    }

    record_id = save_transaction_record(
        workflow_result
    )

    workflow_result["record_id"] = record_id

    return workflow_result
    
    return {
        "transaction": transaction,
        "risk_analysis": risk_result,
        "alert": alert_result,
        "action": action_result
    }