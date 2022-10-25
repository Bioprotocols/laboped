# LabOP User Guide

- Getting Started
    - From the homepage, login with existing credentials (registering if needed).
    - Start editing a protocol.  (See below)
- Loading Protocols
    - If you have a graph file (json) that you previously downloaded, or were given (see `examples`), then click the triangle dropdown button next to the `+` button, and select `Load Rete Graph`.
    - Your saved protocols will also be listed across the top of the screen and can be selected by clicking on the name.
- Saving Protocols
    - Click the triangle dropdown next to the protocol name and select `Save`.  This will save the protocol to the LabOPEd database and it will be available when you login in at a later time.
- Downloading Protocols
    - Click the triangle dropdown next to the protocol name and select `Download Protocol` to save the LabOP RDF.  Similarly, click `Download Rete Graph` to save the visual script graph representing the protocol. This file can also be used later to upload the protocol into LabOPEd for other users or yourself.
- Create a new Protocol
    - Click the "+" button at the top of the screen in the list of protocols.
- Edit a Protocol
    - Add Activities
        - Drag and drop from the palette on the left side.
        - Or, right click on the workspace to bring up a context menu with the list of primitives and protocols.
    - Clone Activities
        - Right click on activity and select `Clone`.
    - Deleting Activities
        - Right click on activity and select `Delete`.
    - Linking ports
        - Click on a port and drag the connector to another port.
    - Unlinking ports
        - Click on port and drag connector off the port, then release the click.
    - Adding Paramters
        - Add a Parameter node in the same manner as an Activity.
        - Configure the name (text), type (dropdown), and value (text).
    - Protocol Inputs and Outputs
        - Add an Input or Output node in the same manner as an Activity.
        - Link the node's port to another Activity port.
        - Saving the protocol will update the node for the protocol so that the protocol can be used as a sub-protocol in another protocol.
    - Creating Primitives
        - Create a protocol and only use Input and Output nodes to define its interface.  This protocol can be used as a new primitive.

# Getting Help
- Create an issue on the Github project: https://github.com/Bioprotocols/laboped
- Contact dbryce@sift.net
