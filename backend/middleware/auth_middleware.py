from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from config import SECRET_KEY, ALGORITHM

# HTTPBearer reads the token from request header automatically
security = HTTPBearer()

# This function runs before any protected route
# It checks if the user has a valid token
def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    
    # Extract the actual token string from the request
    token = credentials.credentials

    try:
        # Open the JWT token using our secret key
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
        # Get user details from the token
        user_id = payload.get("user_id")
        email = payload.get("email")
        role = payload.get("role")

        # If token has no user_id it is invalid
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )

        # Return user info to any route that needs it
        return {"user_id": user_id, "email": email, "role": role}

    except JWTError:
        # Token is fake expired or modified
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

# This function checks if user has the correct role
def require_role(required_role: str):
    def role_checker(current_user: dict = Depends(get_current_user)):
        if current_user["role"] != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Only {required_role}s can do this"
            )
        return current_user
    return role_checker