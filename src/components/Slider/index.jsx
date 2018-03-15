import React, {Component} from 'react';
import BstSlider from 'bootstrap-slider';
import 'bootstrap-slider/dist/css/bootstrap-slider.css';

import {
    Form, FormGroup, Label, Input
} from 'reactstrap';

export default class Slider extends Component {
    componentDidMount() {
        const {onChange, id} = this.props;

        new BstSlider('#' + id, {})
        .on('slide', onChange)
        .on('slideStart', onChange);
    }

    render() { 
        const {
            id, label, 
            min, max, step, current, unit,
            displayValue = () => current
        } = this.props;

        return (
            <Form inline>
                <FormGroup>
                    <Label style={{width: '13rem'}} for={id}>
                        {label} <span className="dataValue">{displayValue()}</span> {unit}
                    </Label>
                    <div style={{marginLeft: '1.5rem'}}>
                        <Input
                            type="text"
                            id={id}
                            data-slider-id="speed-slider-inner"
                            data-slider-min={min}
                            data-slider-max={max}
                            data-slider-step={step}
                            data-slider-value={current}
                            />
                    </div>
                </FormGroup>
            </Form>
        )
    }
}