import React from 'react';
import * as Backend from '../backend.js';

class ProfilingPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            target: 'single',  // Default profiling selected table
            profiling_result: {},
            selected_table_idx: props.selected_table_idx,
            localUCs: {},  // Store UCs temporarily
            hasUcChanges: false,  // Track if there are UCs to apply
            completedTables : 0, // Track completion of profiling for all tables
            selectedAlgorithm: 'default_algorithm',
            profilingStatus: {},
        };
    }

    componentDidMount() {
        const { session } = this.props;
        // Load session to get profiling status
        Backend.get_session(session.id, (response) => {
            const sessionData = JSON.parse(response.session);
            this.setState({ profilingStatus: sessionData.profiling_status || {} });
        });
    }

    handleAlgorithmChange(event) {
        this.setState({ selectedAlgorithm: event.target.value });
    }

    handleTargetChange(event) {
        this.setState({ target: event.target.value });
    }
    

    runProfiling() {
        const { session, selected_table_idx } = this.props;
        const { target, selectedAlgorithm } = this.state;
        let tablesToProfile = [];
    
        if (target === 'single') {
            const table_name = session.tables[selected_table_idx].name;
            tablesToProfile = [table_name];
        } else if (target === 'all') {
            tablesToProfile = session.tables.map(table => table.name);
        }
    
        tablesToProfile.forEach(table_name => {
            Backend.run_profiling(session.id, table_name, ",", target, selectedAlgorithm, (response) => {
                if (response.error) {
                    alert("Profiling Error: " + response.error);
                    return;
                }
                
                const profiling_result = response.profiling_results[table_name] || { ucs: [], fds: [] };
                const attributes = session.tables.find(table => table.name === table_name).attributes.map(attr => attr.name);
    
                // Map to actual column name
                const columnMapping = {};
                attributes.forEach((attr, index) => {
                    const columnKey = `column${index + 1}`;
                    columnMapping[columnKey] = attr;
                });
    
                const mappedUCs = (profiling_result.ucs || []).map(uc => {
                    const columnKeyMatch = uc.match(/column\d+/);
                    if (columnKeyMatch) {
                        const columnKey = columnKeyMatch[0];
                        const attributeName = columnMapping[columnKey];
                        return attributeName ? `[${attributeName}]` : uc;  // Replace with actual name if found
                    }
                    return uc;
                });
    
                const mappedFDs = (profiling_result.fds || []).map(fd => {
                    const parts = fd.split('->');
                    const lhs = parts[0].match(/column\d+/g).map(columnKey => {
                        return columnMapping[columnKey] || columnKey;
                    }).join(',');
                    const rhs = columnMapping[parts[1].match(/column\d+/)[0]] || parts[1];
                    return `[${lhs}]->${rhs}`;
                });
    
                // Update state with mapped results
                this.setState(prevState => {
                    const newCompletedTables = prevState.completedTables + 1;
                    const isComplete = target === 'all' && newCompletedTables === tablesToProfile.length;

                    return {
                        profiling_result: {
                            ...prevState.profiling_result,
                            [table_name]: {
                                ucs: mappedUCs,
                                fds: mappedFDs
                            }
                        },
                        localUCs: {
                            ...prevState.localUCs,
                            [table_name]: mappedUCs
                        },
                        hasUcChanges: true,
                        completedTables: newCompletedTables,
                        profilingComplete: isComplete,
                        profilingStatus: {
                            ...prevState.profilingStatus,
                            [selectedAlgorithm]: isComplete ? true : prevState.profilingStatus[selectedAlgorithm],
                        },
                    };
                });
            });
        });
    }


    applyUcChanges() {
        const { session } = this.props;
        const { localUCs, target } = this.state;
    
        if (target === 'single') {
            const table_name = session.tables[this.props.selected_table_idx].name;
            const tableUCs = localUCs[table_name] || [];
    
            const updatedTables = session.tables.map((table, index) => {
                if (table.name === table_name) {
                    return {
                        ...table,
                        ucs: [...(table.ucs || []), ...tableUCs],
                    };
                }
                return table;
            });
    
            const updatedSession = {
                ...session,
                tables: updatedTables,
            };
    
            this.props.onUpdateSession(updatedSession);
            this.setState({ hasUcChanges: false });
        } else if (target === 'all') {
            const updatedTables = session.tables.map(table => {
                const tableUCs = localUCs[table.name] || [];
                return {
                    ...table,
                    ucs: [...(table.ucs || []), ...tableUCs],
                };
            });
    
            const updatedSession = {
                ...session,
                tables: updatedTables,
            };
    
            this.props.onUpdateSession(updatedSession);
            this.setState({ hasUcChanges: false });
        }
    }
    
    

    render() {
        const { session } = this.props;
        const { target, hasUcChanges, completedTables, selectedAlgorithm, profilingStatus } = this.state;
        const totalTables = target === 'single' ? 1 : session.tables.length;

        return (
            <div style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '5px' }}>
                <h3>Run Profiling</h3>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '10px' }}>
                        <input
                            type="radio"
                            value="single"
                            checked={target === 'single'}
                            onChange={(e) => this.handleTargetChange(e)}
                        />
                        Run Profiling on Selected Table: {session.tables[this.state.selected_table_idx].name}
                    </label>
                    <label style={{ display: 'block', marginBottom: '10px' }}>
                        <input
                            type="radio"
                            value="all"
                            checked={target === 'all'}
                            onChange={(e) => this.handleTargetChange(e)}
                        />
                        Run Profiling on All Tables
                    </label>
                </div>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '10px' }}>
                        <span>Select Algorithm:</span>
                        <select
                            value={selectedAlgorithm}
                            onChange={(e) => this.handleAlgorithmChange(e)}
                            style={{
                                marginLeft: '10px',
                                color: profilingStatus[selectedAlgorithm] ? 'green' : 'black',
                            }}
                        >
                            <option value="default_algorithm">Pyro Algorithm</option>
                            <option value="algorithm_1">Algorithm test</option>
                        </select>
                    </label>
                </div>
                <div>
                    <button
                        onClick={() => this.runProfiling()}
                        style={{
                            backgroundColor: '#007bff',
                            color: '#fff',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '5px',
                            cursor: 'pointer',
                        }}
                    >
                        Execute Profiling
                    </button>
                </div>
                {hasUcChanges && completedTables === totalTables && (
                    <div>
                        <button
                            onClick={() => this.applyUcChanges()}
                            style={{
                                backgroundColor: '#28a745',
                                color: '#fff',
                                border: 'none',
                                padding: '10px 20px',
                                borderRadius: '5px',
                                marginTop: '10px',
                                cursor: 'pointer',
                            }}
                        >
                            Apply UCs to Table
                        </button>
                    </div>
                )}
                {this.renderProfilingResult()}
            </div>
        );
    }

    
    renderProfilingResult() {
        const { profiling_result } = this.state;
        
        // Check if profiling_result contains data
        // prevents empty brackets
        if (!profiling_result || !Object.keys(profiling_result).length) {
            return null;
        }
    
        return (
            <div style={{ marginTop: '20px' }}>
                <h4>Profiling Results</h4>
                <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', backgroundColor: '#f4f4f4', padding: '10px', borderRadius: '5px' }}>
                    {JSON.stringify(profiling_result, null, 2)}
                </pre>
            </div>
        );
    }
    
}

export default ProfilingPanel;



