import asyncio
from agent.workflow import run_agent_workflow


transaction = {
    "amount": 80000,
    "new_device": True,
    "foreign_transaction": True,
    "failed_attempts": 5,
    "odd_hour": True
}


async def main():

    result = await run_agent_workflow(transaction)

    print(result)


asyncio.run(main())