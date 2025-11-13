import streamlit as st

# Set the app title
st.title("Streamlit Counter")

# Use session state to persist the counter value across interactions
if "count" not in st.session_state:
    st.session_state.count = 0

# Define button actions
def increase():
    st.session_state.count += 1

def decrease():
    st.session_state.count -= 1

def reset():
    st.session_state.count = 0

# Display the counter value
st.header(f"{st.session_state.count}")

# Create three buttons in a horizontal layout
col1, col2, col3 = st.columns(3)

with col1:
    st.button("Increase", on_click=increase)
with col2:
    st.button("Decrease", on_click=decrease)
with col3:
    st.button("Reset", on_click=reset)
