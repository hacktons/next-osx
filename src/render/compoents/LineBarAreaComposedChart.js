import React, { PureComponent } from 'react';
import {
    ComposedChart, Line, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    Legend, ResponsiveContainer,
} from 'recharts';

export default class LineBarAreaComposedChart extends PureComponent {

    render() {
        return (
            <ResponsiveContainer>
                <ComposedChart
                    data={this.props.data}
                    margin={{
                        top: 20, right: 20, bottom: 20, left: 20,
                    }}
                >
                    <CartesianGrid stroke="#f5f5f5" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value, name, props) => ([value, this.mapping(name)])} />
                    <Legend />
                    <Area type="monotone" dataKey="total" fill="#8884d8" stroke="#8884d8" />
                    <Bar dataKey="home" barSize={20} fill="#413ea0" />
                    <Line type="monotone" dataKey="splash" stroke="#ff7300" />
                </ComposedChart>
            </ResponsiveContainer>
        );
    }
    mapping = name => {
        return this.props.names && this.props.names[name] ? this.props.names[name] : name;
    }
}
