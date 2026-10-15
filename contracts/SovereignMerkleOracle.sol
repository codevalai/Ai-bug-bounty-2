// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title SovereignMerkleOracle
 * @notice Trustless on-chain settlement anchor for RFC 6962 Merkle Epoch Roots,
 *         SLSA v1.0 Provenance Batch CIDs, and Proof-Carrying Code (PCC) receipts.
 */
contract SovereignMerkleOracle {
    struct EpochCommitment {
        bytes32 merkleRoot;
        uint64 treeSize;
        uint64 anchoredAt;
        string slsaBatchCid;
        address relayer;
    }

    uint256 public currentEpochHeight;
    mapping(uint256 => EpochCommitment) public epochs;
    mapping(bytes32 => uint256) public rootToEpoch;

    event MerkleEpochAnchored(
        uint256 indexed epochHeight,
        bytes32 indexed merkleRoot,
        uint64 treeSize,
        string slsaBatchCid,
        address relayer
    );

    function anchorMerkleEpoch(
        bytes32 _merkleRoot,
        uint64 _treeSize,
        string calldata _slsaBatchCid
    ) external returns (uint256) {
        require(_merkleRoot != bytes32(0), "SovereignOracle: empty root");
        require(_treeSize > 0, "SovereignOracle: zero tree size");

        currentEpochHeight += 1;
        epochs[currentEpochHeight] = EpochCommitment({
            merkleRoot: _merkleRoot,
            treeSize: _treeSize,
            anchoredAt: uint64(block.timestamp),
            slsaBatchCid: _slsaBatchCid,
            relayer: msg.sender
        });
        rootToEpoch[_merkleRoot] = currentEpochHeight;

        emit MerkleEpochAnchored(
            currentEpochHeight,
            _merkleRoot,
            _treeSize,
            _slsaBatchCid,
            msg.sender
        );

        return currentEpochHeight;
    }

    function verifyInclusionLeaf(
        uint256 _epochHeight,
        bytes32 _leafHash,
        bytes32[] calldata _auditPath,
        uint256 _leafIndex
    ) external view returns (bool) {
        bytes32 computedHash = _leafHash;
        uint256 idx = _leafIndex;
        for (uint256 i = 0; i < _auditPath.length; i++) {
            bytes32 sibling = _auditPath[i];
            if (idx % 2 == 0) {
                computedHash = sha256(abi.encodePacked(uint8(0x01), computedHash, sibling));
            } else {
                computedHash = sha256(abi.encodePacked(uint8(0x01), sibling, computedHash));
            }
            idx /= 2;
        }
        return computedHash == epochs[_epochHeight].merkleRoot;
    }
}
