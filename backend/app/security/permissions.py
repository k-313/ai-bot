from enum import Enum
from typing import Optional, Any
from pydantic import BaseModel

class PermissionLevel(str, Enum):
    LEVEL_1_READ = "level_1_read"
    LEVEL_2_CREATE = "level_2_create"
    LEVEL_3_MODIFY_EXECUTE = "level_3_modify_execute"
    LEVEL_4_SENSITIVE = "level_4_sensitive"

class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class ActionPermissionSpec(BaseModel):
    action_name: str
    required_level: PermissionLevel
    risk_level: RiskLevel
    description: str
    requires_explicit_approval: bool

ACTION_REGISTRY: dict[str, ActionPermissionSpec] = {
    "get_time_and_date": ActionPermissionSpec(
        action_name="get_time_and_date",
        required_level=PermissionLevel.LEVEL_1_READ,
        risk_level=RiskLevel.LOW,
        description="Query the current system time and date.",
        requires_explicit_approval=False,
    ),
    "list_approved_files": ActionPermissionSpec(
        action_name="list_approved_files",
        required_level=PermissionLevel.LEVEL_1_READ,
        risk_level=RiskLevel.LOW,
        description="List files inside approved workspace directories.",
        requires_explicit_approval=False,
    ),
    "search_approved_files": ActionPermissionSpec(
        action_name="search_approved_files",
        required_level=PermissionLevel.LEVEL_1_READ,
        risk_level=RiskLevel.LOW,
        description="Search for file names or contents in approved folders.",
        requires_explicit_approval=False,
    ),
    "read_approved_text_file": ActionPermissionSpec(
        action_name="read_approved_text_file",
        required_level=PermissionLevel.LEVEL_1_READ,
        risk_level=RiskLevel.LOW,
        description="Read text contents of an approved file.",
        requires_explicit_approval=False,
    ),
    "search_web": ActionPermissionSpec(
        action_name="search_web",
        required_level=PermissionLevel.LEVEL_1_READ,
        risk_level=RiskLevel.LOW,
        description="Search web for facts and citations.",
        requires_explicit_approval=False,
    ),
    "inspect_task_result": ActionPermissionSpec(
        action_name="inspect_task_result",
        required_level=PermissionLevel.LEVEL_1_READ,
        risk_level=RiskLevel.LOW,
        description="Review output of a prior task or step.",
        requires_explicit_approval=False,
    ),
    "create_output_folder": ActionPermissionSpec(
        action_name="create_output_folder",
        required_level=PermissionLevel.LEVEL_2_CREATE,
        risk_level=RiskLevel.LOW,
        description="Create a new folder in workspace or output directory.",
        requires_explicit_approval=False,
    ),
    "generate_pptx": ActionPermissionSpec(
        action_name="generate_pptx",
        required_level=PermissionLevel.LEVEL_2_CREATE,
        risk_level=RiskLevel.LOW,
        description="Create a PowerPoint presentation file in the output folder.",
        requires_explicit_approval=False,
    ),
    "generate_docx": ActionPermissionSpec(
        action_name="generate_docx",
        required_level=PermissionLevel.LEVEL_2_CREATE,
        risk_level=RiskLevel.LOW,
        description="Create a Word document in the output folder.",
        requires_explicit_approval=False,
    ),
    "generate_pdf": ActionPermissionSpec(
        action_name="generate_pdf",
        required_level=PermissionLevel.LEVEL_2_CREATE,
        risk_level=RiskLevel.LOW,
        description="Create a PDF document in the output folder.",
        requires_explicit_approval=False,
    ),
    "write_approved_file": ActionPermissionSpec(
        action_name="write_approved_file",
        required_level=PermissionLevel.LEVEL_2_CREATE,
        risk_level=RiskLevel.MEDIUM,
        description="Write or create a code/document file in the workspace.",
        requires_explicit_approval=False,
    ),
    "save_task": ActionPermissionSpec(
        action_name="save_task",
        required_level=PermissionLevel.LEVEL_2_CREATE,
        risk_level=RiskLevel.LOW,
        description="Save or record a task in the task database.",
        requires_explicit_approval=False,
    ),
    "update_task_status": ActionPermissionSpec(
        action_name="update_task_status",
        required_level=PermissionLevel.LEVEL_2_CREATE,
        risk_level=RiskLevel.LOW,
        description="Update status and progress of a task.",
        requires_explicit_approval=False,
    ),
    "run_approved_test": ActionPermissionSpec(
        action_name="run_approved_test",
        required_level=PermissionLevel.LEVEL_3_MODIFY_EXECUTE,
        risk_level=RiskLevel.MEDIUM,
        description="Run an approved test suite (e.g. pytest or npm test) in the project.",
        requires_explicit_approval=True,
    ),
    "open_approved_application": ActionPermissionSpec(
        action_name="open_approved_application",
        required_level=PermissionLevel.LEVEL_3_MODIFY_EXECUTE,
        risk_level=RiskLevel.MEDIUM,
        description="Launch an allowlisted Windows desktop application (e.g. notepad, calc).",
        requires_explicit_approval=True,
    ),
    "delete_file": ActionPermissionSpec(
        action_name="delete_file",
        required_level=PermissionLevel.LEVEL_4_SENSITIVE,
        risk_level=RiskLevel.HIGH,
        description="Permanently delete a file from disk.",
        requires_explicit_approval=True,
    ),
    "update_system_settings": ActionPermissionSpec(
        action_name="update_system_settings",
        required_level=PermissionLevel.LEVEL_4_SENSITIVE,
        risk_level=RiskLevel.HIGH,
        description="Modify critical system or assistant security settings.",
        requires_explicit_approval=True,
    ),
}

def get_action_spec(action_name: str) -> ActionPermissionSpec:
    if action_name in ACTION_REGISTRY:
        return ACTION_REGISTRY[action_name]
    return ActionPermissionSpec(
        action_name=action_name,
        required_level=PermissionLevel.LEVEL_4_SENSITIVE,
        risk_level=RiskLevel.HIGH,
        description=f"Perform custom action '{action_name}'.",
        requires_explicit_approval=True,
    )
